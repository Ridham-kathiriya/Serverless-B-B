from firebase_admin import firestore, credentials, initialize_app
from flask import escape
import datetime
from uuid import uuid4
from operator import itemgetter
cred = credentials.ApplicationDefault()
initialize_app(cred, {
    'projectId': 'serverlessbnb-354422',
})    
    
def update_session_timestamp(request):
    db = firestore.client()

    print(request)
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>`.
    """
    headers = {
        'Access-Control-Allow-Origin': '*',
    }
    if(request.method == 'OPTIONS'):
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',

        }
        return('', 204, headers)
    
    request_json = request.get_json()
    print(request_json)
    request_args = request.args
    collection_name = "user-login-stats"
    login_timestamp = datetime.datetime.now()
    logout_timestamp = datetime.datetime.now()
    user_email = request_json["email"]
    db_doc = db.collection(collection_name).where("email", "==", user_email).get()
    doc_list = []
    if db_doc:
        for d in db_doc:
            document_dict = d.to_dict()
            document_dict['id'] = d.id
            doc_list.append(document_dict)
        sorted_doc = sorted(doc_list, key=itemgetter("login_timestamp"), reverse=True)
        logout_not_found = False
        obj_id = ""
        for obj in sorted_doc:
            if "logout_timestamp" not in obj:
                logout_not_found = True
                obj_id = obj['id']
                break
            else:
                logout_not_found = False
        if logout_not_found:
            update_req = {"logout_timestamp": logout_timestamp}
            db.collection(collection_name).document(obj_id).update(update_req)
            print(f"Doc updated. Request: {update_req}")
            return ({"message": f"Doc updated. Request: {update_req}", "success": True}, 200, headers)
        else:
            new_doc = db.collection(collection_name).document(str(uuid4()))
            set_request = {
                "email": user_email,
                "login_timestamp": login_timestamp
            }
            new_doc.set(set_request)
            print(f"New doc created. Request: {set_request}")
            return ({"message": f"New doc created. Request: {set_request}", "success": False}, 200, headers)
    else:
        new_doc = db.collection(collection_name).document(str(uuid4()))
        set_request = {
            "email": user_email,
            "login_timestamp": login_timestamp
        }
        new_doc.set(set_request)
        print(f"New doc created. Request: {set_request}")
        return ({"message": f"New doc created. Request: {set_request}", "success": False}, 200, headers)