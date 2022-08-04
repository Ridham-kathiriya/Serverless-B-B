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
    final_response = {}
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

    user_id = request_json['user_id']
    checkin_date = request_json['checkin_date']
    checkout_date = request_json['checkout_date']
    room_type = request_json['room_type']
    rooms_qty = request_json['rooms_qty']

    all_dates = getAllDates(checkin_date, checkout_date)

    room_type_str = 'count_' + room_type
    if not firebase_admin._apps:
      cred = credentials.ApplicationDefault()

      default_app = firebase_admin.initialize_app(cred, {
      'projectId': 'serverlessbnb-354422',
      })
    
    db = firestore.client()

    room_availability = db.collection('room_availability')

    isRoomAvailable = True

    for everyDay in all_dates:
      doc_date_ref = room_availability.document(everyDay)
      doc = doc_date_ref.get()
      if(doc.exists):
        if(doc.to_dict()[room_type_str] >= int(rooms_qty)):
          continue
      isRoomAvailable = False
      resp = {
        "message": "Requested rooms not available on one or more dates",
        "success": False
      }
      return (resp,200, headers)
    

    if(isRoomAvailable):
        for everyDay in all_dates:
            doc_date_ref = room_availability.document(everyDay)
            doc_data = doc_date_ref.get().to_dict()
            doc_data[room_type_str] = doc_data[room_type_str] - rooms_qty
            doc_date_ref.set(doc_data)

        booked_rooms = db.collection('room_booking')
        booking = {}
        doc_ref = booked_rooms.document(user_id)
        doc = doc_ref.get()
        if doc.exists:
            booking = doc.to_dict()
        booking[room_type] = {
            "checkin_date": checkin_date,
            "checkout_date": checkout_date,
            "rooms_qty": rooms_qty
        }

        doc_ref.set(booking)

        final_response = {
            "message": "Booking created successfully",
            "success": True,
            "booking_details": booking[room_type]
        }
        # push the notific
        print("------PUSHING NOTIFICATION-------")
        rooms = ["NonAC","AC","Deluxe","Suite"]
        amount_ref = db.collection('rooms').document(str(rooms.index(room_type)+1))
        amount = amount_ref.get().to_dict()['room_price'] * rooms_qty

        notific_ref = db.collection('notifications').document(user_id)
        if(notific_ref.get().exists):
          notific_ref.update({
            u'invoices': firestore.ArrayUnion([{
              "amount": amount,
              "order_id": user_id,
              "order_type": room_type,
              "status": "confirmed"
            }])
          })
          notific_ref.update({
            u'notifications': firestore.ArrayUnion([{
              "message": "Stay booked successfully. Booking ID: " + user_id,
              "timestamp": str(datetime.now())
            }])
          })
        else:
          print("NOTIFICATION PUSHING FAILED. USER'S DOCUMENT NOT FOUND")
    else:    
      final_response = {
        "message": "Not enough rooms available",
        "success": False
      }
    return (final_response, 200, headers)