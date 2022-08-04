from firebase_admin import firestore, credentials, initialize_app
from flask import escape
import datetime
from uuid import uuid4
import functions_framework
from operator import itemgetter

cred = credentials.ApplicationDefault()
initialize_app(cred, {
    'projectId': 'serverlessbnb-354422',
})

@functions_framework.http
def get_session_for_user(request):
        
    db = firestore.client()
    try:
        # request_json = request.get_json(silent=True)
        request_args = request.args
        print(request_args)
        # headers = {
        # 'Access-Control-Allow-Origin': '*',
        # }
        
        # if(request.method == 'OPTIONS'):

        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',

        }
        user_email = request.args.get("email")
        print("email: ",user_email)
        collection_name = "user-login-stats"
        db_doc = db.collection(collection_name).where("email", "==", user_email).get()
        doc_list = []
        if db_doc:
            for d in db_doc:
                document_dict = d.to_dict()
                document_dict['id'] = d.id
                doc_list.append(document_dict)
        print(doc_list)
        sorted_doc = sorted(doc_list, key=itemgetter("login_timestamp"), reverse=True)
        return ({"message": sorted_doc, "success": True}, 200, headers)
        # else:
        #     return('', 204, headers)
    except Exception as e:
        return ({"message": e, "success": False}, 500, headers)