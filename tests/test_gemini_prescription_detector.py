"""
Unit and Integration Tests for Google Gemini Prescription Detector in CareSaathi AI
All tests mock the Gemini SDK responses - NO live API calls required.
"""

import os
import sys
import json
import unittest
from unittest.mock import patch, MagicMock

# Ensure repo root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.config import settings
from backend.app.services.vision_extractor import (
    extract_medicines_with_gemini,
    clean_json_text,
    VISION_PROMPT
)
from backend.app.services.ocr_service import process_prescription_ocr
from backend.app.models.schemas import PrescriptionOCRRequest
from google.genai import errors


class TestGeminiPrescriptionDetector(unittest.TestCase):
    def setUp(self):
        # Create dummy 100-byte JPEG bytes for testing
        self.sample_jpeg_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xFF\xDB\x00C\x00" + b"\x00" * 80

    def test_clean_json_text(self):
        """Test markdown code fence stripping from raw model text."""
        raw_with_fence = '```json\n{"medicines": []}\n```'
        self.assertEqual(clean_json_text(raw_with_fence), '{"medicines": []}')

        raw_simple_fence = '```\n{"medicines": []}\n```'
        self.assertEqual(clean_json_text(raw_simple_fence), '{"medicines": []}')

        raw_clean = '{"medicines": []}'
        self.assertEqual(clean_json_text(raw_clean), '{"medicines": []}')

    @patch("backend.app.services.vision_extractor.genai.Client")
    def test_extract_medicines_success_mock(self, mock_client_cls):
        """Test successful medicine extraction with mocked Gemini response."""
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "medicines": [
                {
                    "name_as_written": "Tab Dolo 650mg TDS x 5 days",
                    "brand_name": "Dolo",
                    "generic_name": "Paracetamol",
                    "strength": "650 mg",
                    "form": "Tablet",
                    "dosage_pattern": "TDS",
                    "duration_days": 5,
                    "quantity": 15,
                    "confidence": 0.98
                },
                {
                    "name_as_written": "Cap Pan 40mg OD x 15 days",
                    "brand_name": "Pan",
                    "generic_name": "Pantoprazole",
                    "strength": "40 mg",
                    "form": "Tablet",
                    "dosage_pattern": "OD",
                    "duration_days": 15,
                    "quantity": 15,
                    "confidence": 0.95
                }
            ],
            "doctor_name": "Dr. K. Rama Rao, MS (Ortho)",
            "date": "2026-03-15",
            "unreadable_parts": []
        })
        mock_client.models.generate_content.return_value = mock_response

        # Call with our dummy image bytes
        with patch.object(settings, "GEMINI_API_KEY", "test_mock_api_key"):
            result = extract_medicines_with_gemini(self.sample_jpeg_bytes)

        self.assertIsNotNone(result)
        self.assertIn("medicines", result)
        self.assertEqual(len(result["medicines"]), 2)
        self.assertEqual(result["doctor_name"], "Dr. K. Rama Rao, MS (Ortho)")
        self.assertEqual(result["medicines"][0]["brand_name"], "Dolo")
        self.assertEqual(result["medicines"][0]["strength"], "650 mg")
        self.assertEqual(result["medicines"][0]["quantity"], 15)
        self.assertEqual(result["medicines"][1]["brand_name"], "Pan")
        self.assertEqual(result["medicines"][1]["strength"], "40 mg")

    @patch("backend.app.services.vision_extractor.genai.Client")
    def test_unclear_handwriting_preserves_nulls_and_unreadable_parts(self, mock_client_cls):
        """Test that illegible parts return null and are not hallucinated."""
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "medicines": [
                {
                    "name_as_written": "Metformin [unclear strength]",
                    "brand_name": "Metformin",
                    "generic_name": "Metformin Hydrochloride",
                    "strength": None,
                    "form": "Tablet",
                    "dosage_pattern": None,
                    "duration_days": None,
                    "quantity": None,
                    "confidence": 0.52
                }
            ],
            "doctor_name": None,
            "date": None,
            "unreadable_parts": [
                "Line 2: Illegible cursive writing across Rx symbol",
                "Line 4: Unclear number notation near dose"
            ]
        })
        mock_client.models.generate_content.return_value = mock_response

        with patch.object(settings, "GEMINI_API_KEY", "test_mock_api_key"):
            result = extract_medicines_with_gemini(self.sample_jpeg_bytes)

        self.assertIsNotNone(result)
        self.assertEqual(len(result["medicines"]), 1)
        med = result["medicines"][0]
        self.assertIsNone(med["strength"])
        self.assertIsNone(med["dosage_pattern"])
        self.assertIsNone(med["quantity"])
        self.assertEqual(len(result["unreadable_parts"]), 2)
        self.assertIn("Line 2: Illegible cursive writing", result["unreadable_parts"][0])

    def test_missing_api_key_graceful_handling(self):
        """Test that missing GEMINI_API_KEY returns None gracefully without crashing."""
        with patch.object(settings, "GEMINI_API_KEY", ""):
            with patch.dict(os.environ, {"GEMINI_API_KEY": "", "GOOGLE_API_KEY": ""}):
                result = extract_medicines_with_gemini(self.sample_jpeg_bytes)
                self.assertIsNone(result)

    def test_empty_image_bytes_graceful_handling(self):
        """Test that empty image bytes return None gracefully."""
        result = extract_medicines_with_gemini(b"")
        self.assertIsNone(result)

    @patch("backend.app.services.vision_extractor.genai.Client")
    def test_quota_limit_429_graceful_handling(self, mock_client_cls):
        """Test that HTTP 429 / Quota Limit APIError is handled gracefully without 500 error."""
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client

        # Simulate ClientError with 429 quota exhaustion
        error_resp = errors.ClientError(
            429,
            {"error": {"message": "Resource has been exhausted: quota exceeded", "status": "RESOURCE_EXHAUSTED"}}
        )
        mock_client.models.generate_content.side_effect = error_resp

        with patch.object(settings, "GEMINI_API_KEY", "test_mock_api_key"):
            result = extract_medicines_with_gemini(self.sample_jpeg_bytes)
            # Should catch error, log warning, and return None
            self.assertIsNone(result)

    @patch("backend.app.services.vision_extractor.genai.Client")
    def test_server_error_500_graceful_handling(self, mock_client_cls):
        """Test that HTTP 500 ServerError is caught and handled gracefully."""
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client

        error_resp = errors.ServerError(
            500,
            {"error": {"message": "Internal server error on Google model backend", "status": "INTERNAL"}}
        )
        mock_client.models.generate_content.side_effect = error_resp

        with patch.object(settings, "GEMINI_API_KEY", "test_mock_api_key"):
            result = extract_medicines_with_gemini(self.sample_jpeg_bytes)
            self.assertIsNone(result)

    @patch("backend.app.services.vision_extractor.genai.Client")
    def test_model_configurability(self, mock_client_cls):
        """Test that GEMINI_MODEL is configurable via environment settings."""
        mock_client = MagicMock()
        mock_client_cls.return_value = mock_client

        mock_response = MagicMock()
        mock_response.text = json.dumps({"medicines": []})
        mock_client.models.generate_content.return_value = mock_response

        with patch.object(settings, "GEMINI_API_KEY", "test_mock_api_key"):
            with patch.object(settings, "GEMINI_MODEL", "gemini-custom-model"):
                extract_medicines_with_gemini(self.sample_jpeg_bytes)
                mock_client.models.generate_content.assert_called()
                call_kwargs = mock_client.models.generate_content.call_args[1]
                self.assertEqual(call_kwargs["model"], "gemini-custom-model")

    @patch("backend.app.services.ocr_service.extract_medicines_with_gemini")
    @patch("backend.app.services.ocr_service.process_uploaded_document")
    def test_end_to_end_ocr_with_mocked_gemini_uses_verified_prices(self, mock_preprocess, mock_gemini):
        """
        Integration test: Verifies that end-to-end OCR uses verified catalogue
        pricing and NEVER uses unverified AI prices.
        """
        # Mock preprocessing returning 1 page
        mock_preprocess.return_value = [(MagicMock(), self.sample_jpeg_bytes)]

        # Mock Gemini returning candidate medications
        mock_gemini.return_value = {
            "medicines": [
                {
                    "name_as_written": "Dolo 650",
                    "brand_name": "Dolo",
                    "generic_name": "Paracetamol",
                    "strength": "650 mg",
                    "form": "Tablet",
                    "dosage_pattern": "TDS",
                    "duration_days": 5,
                    "quantity": 15,
                    "confidence": 0.95
                }
            ],
            "doctor_name": "Dr. Sharma",
            "date": "2026-03-15",
            "unreadable_parts": []
        }

        response = process_prescription_ocr(
            file_bytes=self.sample_jpeg_bytes,
            filename="rx_sample.jpg"
        )

        self.assertEqual(response.source, "gemini_vision")
        self.assertTrue(response.requires_user_confirmation)
        self.assertEqual(len(response.medicines), 1)

        matched = response.medicines[0]
        # Verify medicine was matched against official catalogue
        self.assertEqual(matched["matched_brand_name"], "Dolo 650")
        self.assertTrue(matched["is_verified"])
        # Prices must come from verified database (Dolo 650 MRP is ₹30.91 for pack of 15)
        self.assertIsNotNone(matched["cost_branded"])
        self.assertIsNotNone(matched["cost_jan_aushadhi"])
        self.assertGreater(matched["cost_branded"], matched["cost_jan_aushadhi"])

    def test_env_is_ignored_by_git(self):
        """Verify that .env is ignored by Git to prevent secrets leakage."""
        import subprocess
        result = subprocess.run(
            ["git", "check-ignore", ".env"],
            capture_output=True,
            text=True,
            cwd=os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn(".env", result.stdout.strip())


if __name__ == "__main__":
    unittest.main()
