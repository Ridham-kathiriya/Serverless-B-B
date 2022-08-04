import string
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

alphabet = string.ascii_lowercase.upper()

def main(request):
    headers = {
        'Access-Control-Allow-Origin': '*',
    }
    if(request.method == 'OPTIONS'):
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',

        }
        return('', 204, headers)
    
    request_json = request.get_json()

    cipher_text = request_json['cipher_text']
    plain_text = request_json['plain_text'].upper()
    user_id = request_json['user_id']
    key = None


    if not firebase_admin._apps:
        cred = credentials.ApplicationDefault()

        default_app = firebase_admin.initialize_app(cred, {
        'projectId': 'serverlessbnb-354422',
        })

    
    db = firestore.client()

    caesar_keys = db.collection('caesar_keys').document(user_id)
    doc = caesar_keys.get()
    if(doc.exists):
        data = doc.to_dict()
        key = data['key']
    else:
        resp = {
            "message": "User does not exist",
            "success": False
        }
        return (resp,200,headers)

    enc_text = ""

    for character in plain_text:
        if character in alphabet:
            position = alphabet.find(character)
            index = (position + key) % 26
            enc_character = alphabet[index]
            enc_text += enc_character
        else:
            enc_text += character
    success = cipher_text.lower() == enc_text.lower()

    resp = {
        "cipher_text": enc_text,
        "success": success
    }

    return(resp, 200, headers)