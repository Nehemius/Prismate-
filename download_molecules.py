import os
import urllib.request
import urllib.parse
import time

compounds = {
    "propene": "propene",
    "propan-1-ol": "1-propanol",
    "2-bromopropane": "2-bromopropane",
    "1-bromopropane": "1-bromopropane",
    "but-2-ene": "2-butene",
    "acetaldehyde": "acetaldehyde",
    "ethanol": "ethanol",
    "acetic-acid": "acetic acid",
    "ethyl-acetate": "ethyl acetate",
    "benzene": "benzene",
    "toluene": "toluene",
    "3-hydroxybutanal": "3-hydroxybutanal",
    "benzaldehyde": "benzaldehyde",
    "benzyl-alcohol": "benzyl alcohol",
    "chloromethane": "chloromethane",
    "methanol": "methanol",
    "tert-butyl-chloride": "2-chloro-2-methylpropane",
    "tert-butyl-alcohol": "2-methylpropan-2-ol"
}

output_dir = os.path.join("public", "molecules")
os.makedirs(output_dir, exist_ok=True)

print(f"Downloading molecule 3D SDF files to {output_dir}...")

for filename, pubchem_name in compounds.items():
    encoded_name = urllib.parse.quote(pubchem_name)
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{encoded_name}/SDF?record_type=3d"
    output_path = os.path.join(output_dir, f"{filename}.sdf")
    
    print(f"Downloading {pubchem_name} -> {output_path}...")
    try:
        urllib.request.urlretrieve(url, output_path)
        print(f"Successfully downloaded {filename}.sdf")
        time.sleep(1) # Rate limit respect
    except Exception as e:
        print(f"Failed to download {pubchem_name}: {e}")

print("Done downloading molecules!")
