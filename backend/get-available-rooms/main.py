import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from datetime import datetime, timedelta


def getAllDates(start, end):
  start = datetime(int(start[6:]), int(start[:2]), int(start[3:5]))
  end = datetime(int(end[6:]), int(end[:2]), int(end[3:5]))
  delta = end - start
  days = [start + timedelta(days=i) for i in range(delta.days + 1)]
  ret = [str(i)[5:7]+'-' +str(i)[8:10] + '-' + str(i)[:4] for i in days]
  return ret


def main(request):
    headers = {
        'Access-Control-Allow-Origin': '*',
    }
    if(request.method == 'OPTIONS'):
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',

        }
        return('', 204, headers)
        
    request_json = request.get_json()
    start_date = request_json['checkin_date']
    end_date = request_json['checkout_date']

    requested_dates = getAllDates(start_date, end_date)

    if not firebase_admin._apps:
        cred = credentials.ApplicationDefault()

        default_app = firebase_admin.initialize_app(cred, {
        'projectId': 'serverlessbnb-354422',
        })

    db = firestore.client()
    available_rooms = db.collection('room_availability')

    response = {}

    for each_date in requested_dates:
        doc_ref = available_rooms.document(each_date)
        doc = doc_ref.get()
        if doc.exists:
            response[each_date] = doc.to_dict()
        else:
            continue
    return (response,200, headers)