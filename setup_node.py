import urllib.request
import zipfile
import os
import shutil

url = 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip'
dest_zip = r'C:\Users\shara\node.zip'
dest_dir = r'C:\Users\shara\node'

if not os.path.exists(r'C:\Users\shara\node\node.exe'):
    print('Downloading node zip from', url)
    urllib.request.urlretrieve(url, dest_zip)
    print('Extracting...')
    with zipfile.ZipFile(dest_zip, 'r') as zip_ref:
        zip_ref.extractall(r'C:\Users\shara')

    extracted_folder = r'C:\Users\shara\node-v20.18.0-win-x64'
    if os.path.exists(dest_dir):
        shutil.rmtree(dest_dir)
    os.rename(extracted_folder, dest_dir)
    if os.path.exists(dest_zip):
        os.remove(dest_zip)
    print('Node.js extracted successfully!')
else:
    print('Node.js already present at', dest_dir)
