import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

def main(request):
    user_id = request.args.get('user_id')

    cred = credentials.ApplicationDefault()

    default_app = firebase_admin.initialize_app(cred, {
    'projectId': 'serverlessbnb-354422',
    })
    
    db = firestore.client()
    doc_ref = db.collection('security_questions').document(user_id)
    doc = doc_ref.get()
    response = {}
    if doc.exists:
        response = doc.to_dict()
        response['success'] = True
    else:
        response = {
            "message": "User not found",
            "success": False
        }
    return response