import json
import datetime
import time
import os
import dateutil.parser
import re
import urllib3 


BOOK_TOUR_API_ENDPOINT = "https://serverlessbnb-api-gateway-810uybt.uc.gateway.dev/book-tour"
ORDER_MEAL_API_ENDPOINT = "https://serverlessbnb-api-gateway-810uybt.uc.gateway.dev/book-meal"
AVAILABLE_ROOMS_API_ENDPOINT = "https://serverlessbnb-api-gateway-810uybt.uc.gateway.dev/get-available-rooms"
BOOK_ROOMS_API_ENDPOINT = "https://serverlessbnb-api-gateway-810uybt.uc.gateway.dev/book-rooms"


def elicit_slot(intent_name, slots, slot_to_elicit, message):
    return {
        'dialogAction': {
            'type': 'ElicitSlot',
            'intentName': BookTour,
            'slots': slots,
            'slotToElicit': slot_to_elicit,
            'message': message
        }
    }


def confirm_intent(intent_name, slots, message):
    return {
        'dialogAction': {
            'type': 'ConfirmIntent',
            'intentName': BookTour,
            'slots': slots,
            'message': message
        }
    }


def close(fulfillment_state, message):
    response = {
        'dialogAction': {
            'type': 'Close',
            'fulfillmentState': fulfillment_state,
            'message': message
        }
    }
    return response
    

def delegate(slots):
    return {
        'dialogAction': {
            'type': 'Delegate',
            'slots': slots
        }
    }


def safe_int(n):
    if n is not None:
        return int(n)
    return n


def try_ex(func):
    try:
        return func()
    except KeyError:
        return None


def get_tour_id(tour_type):
    tours = {"adventure" : 1, "wildlife": 2, "nature": 3}
    return tours[tour_type.lower()]


def get_meal_id(meal_type):
    meals = {"veg" : 1, "non-veg":2}
    return meals[meal_type.lower()]
    

def get_room_type_id(room_type):
    rooms = {"non-ac" : 1, "ac": 2, "delux": 3, "suite": 4}
    return rooms[room_type.lower()]

def get_navigation_link(webpage):
    login = ['login', 'sign in', 'sign-in', 'signin']
    LOGIN_URL = 'https://main.d1gwq7lhjz8oz9.amplifyapp.com/login'
    signup = ['signup', 'sign up', 'sign-up', 'register']
    SIGNUP_URL = 'https://main.d1gwq7lhjz8oz9.amplifyapp.com/register'
    tour = ['tour', 'book tour', 'tour booking']
    TOUR_URL = 'https://main.d1gwq7lhjz8oz9.amplifyapp.com/tours'
    room = ['room', 'room booking', 'book room']
    ROOM_URL = 'https://main.d1gwq7lhjz8oz9.amplifyapp.com/'
    meal = ['meal ordering', 'meal', 'food order', 'order food']
    MEAL_URL = 'https://main.d1gwq7lhjz8oz9.amplifyapp.com/meals'
    
    if webpage in login:
        return LOGIN_URL
    elif webpage in signup:
        return SIGNUP_URL
    elif webpage in tour:
        return TOUR_URL
    elif webpage in room:
        return ROOM_URL
    elif webpage in meal:
        return MEAL_URL
    else: 
        return None


def isvalid_tour_type(tour_type):
    valid_tour_types = ['adventure', 'wildlife', 'nature']
    return tour_type.lower() in valid_tour_types
    
    
def isvalid_room_type(room_type):
    valid_room_types = ['non-ac', 'ac', 'delux', 'suite']
    return room_type.lower() in valid_room_types
    

def isvalid_meal_type(meal_type):
    valid_meal_types = ['veg', 'non-veg']
    return meal_type.lower() in valid_meal_types
    
    
def isvalid_people(people):
    return isinstance(people, int)
    

def isvalid_meal_quantity(meal_quantity):
    return isinstance(meal_quantity, int)
    

def isvalid_room_quantity(room_quantity):    
    return isinstance(room_quantity, int)
    
def isValid(email):
    regex = re.compile(r'([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+')
    return re.fullmatch(regex, email)


def isvalid_date(date):
    try:
        dateutil.parser.parse(date)
        return True
    except ValueError:
        return False


def build_validation_result(isvalid, violated_slot, message_content):
    return {
        'isValid': isvalid,
        'violatedSlot': violated_slot,
        'message': {'contentType': 'PlainText', 'content': message_content}
    }


def validate_available_rooms(slots):
    check_in_date = try_ex(lambda: slots['check_in_date'])
    check_out_date = try_ex(lambda: slots['check_out_date'])
    
    if check_in_date and not isvalid_date(check_in_date):
        return build_validation_result(
            False,
            'check_in_date',
            'Invalid date format! Kindly provide proper date format..!'
        )
        
    if check_out_date and not isvalid_date(check_out_date):
        return build_validation_result(
            False,
            'check_out_date',
            'Invalid date format! Kindly provide proper date format..!'
        )
    return {'isValid': True}    


def validate_meal_order(slots):
    meal_type = try_ex(lambda: slots['mealType'])
    meal_quantity = safe_int(try_ex(lambda: slots['mealQuantity']))
    email = try_ex(lambda: slots['email'])
    
    if meal_type and not isvalid_meal_type(meal_type):
        return build_validation_result(
            False,
            'mealType',
            'We currently do not serve {} meal. Please select from available meal options..!'.format(meal_type)
        )
    
    if meal_quantity and isvalid_meal_quantity(meal_quantity):
        return build_validation_result(
            False,
            'mealQuantity',
            '{} is invalid value for number of meals. Kindly provide numeric value for number of meals'.format(meal_quantity)
        )
        
    if email and not isvalid_email(email):
        return build_validation_result(
            False,
            'email',
            '{} is invalid email address. Please provide valid email address..!'.format(email)
        )
    return {'isValid': True}
    

def validate_book_room(slots):
    check_in_date = try_ex(lambda: slots['check_in_date'])
    check_out_date = try_ex(lambda: slots['check_out_date'])
    room_type = try_ex(lambda: slots['roomType'])
    room_quantity = try_ex(lambda: slots['room_quantity'])
    email = try_ex(lambda: slots['email'])
    
    if check_in_date and not isvalid_date(check_in_date):
        return build_validation_result(
            False,
            'check_in_date',
            'Invalid date format! Kindly provide proper date format..!'
        )
        
    if check_out_date and not isvalid_date(check_out_date):
        return build_validation_result(
            False,
            'check_out_date',
            'Invalid date format! Kindly provide proper date format..!'
        )
    
    if room_type and not isvalid_room_type(room_type):
        return build_validation_result(
            False,
            'room_type',
            'We currently do not have {} room option. Please select from available room options..!'.format(room_type)
        )
    
    if room_quantity and isvalid_room_quantity(room_quantity):
        return build_validation_result(
            False,
            'room_quantity',
            '{} is invalid value for number of rooms. Kindly provide numeric value for number of rooms'.format(room_quantity)
        )
    
    if email and not isvalid_email(email):
        return build_validation_result(
            False,
            'email',
            '{} is invalid email address. Please provide valid email address..!'.format(email)
        )    
        

def validate_tour(slots):
    tour_type = try_ex(lambda: slots['tourType'])
    people = safe_int(try_ex(lambda: slots['people']))
    email = try_ex(lambda: slots['email'])
    
    if tour_type and not isvalid_tour_type(tour_type):
        return build_validation_result(
            False,
            'tourType',
            'We currently do not provide {} tour. Please select from available tours..!'.format(tour_type)
        )
        
    if people and isvalid_people(people):
        return build_validation_result(
            False,
            'people',
            '{} is invalid value for number of people. Kindly provide numeric value for number of people'.format(people)
        )
    
    if email and not isvalid_email(email):
        return build_validation_result(
            False,
            'email',
            '{} is invalid email address. Please provide valid email address..!'.format(email)
        )
    
    return {'isValid': True}
    

def navigation(intent_request):
    webpage = try_ex(lambda: intent_request['currentIntent']['slots']['webpage'])
    
    NAVIGATION_URL = get_navigation_link(webpage.lower())
    
    if NAVIGATION_URL:
        fulfillmentState = 'Fulfilled'
        message = f'Copy paste the link below in your browser to navigate to {webpage} page: \n' + NAVIGATION_URL
        return close(
            fulfillmentState,
            {
                'contentType': 'PlainText',
                'content': message
            }
        )
    else:
        fulfillmentState = 'Failed'
        message = 'Sorry could not find the navigation for the page you requested'
        return close(
        fulfillmentState,
        {
            'contentType': 'PlainText',
            'content': message
        }
    )
    

def get_available_rooms(intent_request):
    check_in_date = try_ex(lambda: intent_request['currentIntent']['slots']['check_in_date'])
    check_out_date = try_ex(lambda: intent_request['currentIntent']['slots']['check_out_date'])
    
    print('check_in_date: ', check_in_date)
    print('check_out_date: ', check_out_date)
    
    if intent_request['invocationSource'] == 'DialogCodeHook':
        validation_result = validate_available_rooms(intent_request['currentIntent']['slots'])
        if not validation_result['isValid']:
            slots = intent_request['currentIntent']['slots']
            slots[validation_result['violatedSlot']] = None

            return elicit_slot(
                intent_request['currentIntent']['name'],
                slots,
                validation_result['violatedSlot'],
                validation_result['message']
            )

        return delegate(intent_request['currentIntent']['slots'])
    
    check_in_date = dateutil.parser.parse(check_in_date)
    check_in_date_year = check_in_date.year
    check_in_date_month = check_in_date.month
    check_in_date_day = check_in_date.day
    
    check_out_date = dateutil.parser.parse(check_out_date)
    check_out_date_year = check_out_date.year
    check_out_date_month = check_out_date.month
    check_out_date_day = check_out_date.day
    
    if len(str(check_in_date_day)) == 1:
        check_in_date_day = "0" + str(check_in_date_day)
    else:
        check_in_date_day = str(check_in_date_day)
    if len(str(check_in_date_month)) == 1:
        check_in_date_month = "0" + str(check_in_date_month)
    else:
        check_in_date_month = str(check_in_date_month)
    if len(str(check_out_date_day)) == 1:
        check_out_date_day = "0" + str(check_out_date_day)
    else:
        check_out_date_day = str(check_out_date_day)
    if len(str(check_out_date_month)) == 1:
        check_out_date_month = "0" + str(check_out_date_month)
    else:
        check_out_date_month = str(check_out_date_month)
        
    check_in_date = check_in_date_month + "-" + check_in_date_day + "-" + str(check_in_date_year)
    check_out_date = check_out_date_month + "-" + check_out_date_day + "-" + str(check_out_date_year)    
    
    dates = {
        'checkin_date': check_in_date,
        'checkout_date': check_out_date
    }
    
    http = urllib3.PoolManager()
    res = http.request('POST', AVAILABLE_ROOMS_API_ENDPOINT,
                 headers={'Content-Type': 'application/json'},
                 body=json.dumps(dates))
    response = json.loads(res.data.decode('utf-8'))

    if res.status == 200:
        fulfillmentState = 'Fulfilled'
        availability = 'We currently have following room availability: '
        for key, value in response.items():
            availability += key +" => "
            for type, qty in value.items():
                availability += type.replace('count_', '') + ": " + str(qty) + " "
        message = availability
    else:
        fulfillmentState = 'Failed'
        message = 'No rooms are currently availability for this duration!'
        
    return close(
        fulfillmentState,
        {
            'contentType': 'PlainText',
            'content': message
        }
    )
    
    

def order_meal(intent_request):
    meal_type = try_ex(lambda: intent_request['currentIntent']['slots']['mealType'])
    meal_quantity = try_ex(lambda: intent_request['currentIntent']['slots']['mealQuantity'])
    email = intent_request['sessionAttributes']['userID']
    
    print('Meal Type: ', meal_type)
    print('Meal Quantity: ', meal_quantity)
    print('Email: ', email)
    
    if intent_request['invocationSource'] == 'DialogCodeHook':
        validation_result = validate_meal_order(intent_request['currentIntent']['slots'])
        if not validation_result['isValid']:
            slots = intent_request['currentIntent']['slots']
            slots[validation_result['violatedSlot']] = None

            return elicit_slot(
                intent_request['currentIntent']['name'],
                slots,
                validation_result['violatedSlot'],
                validation_result['message']
            )

        return delegate(intent_request['currentIntent']['slots'])
        
    meal_quantity = safe_int(meal_quantity)
    meal_data = {
                    "user": email,
                    "id": get_meal_id(meal_type),
                    "quantity": meal_quantity
                }
    http = urllib3.PoolManager()
    res = http.request('POST', ORDER_MEAL_API_ENDPOINT,
                 headers={'Content-Type': 'application/json'},
                 body=json.dumps(meal_data))
    response = json.loads(res.data.decode('utf-8'))

    if response['success']:
        fulfillmentState = 'Fulfilled'
        message = response['message']
    else:
        fulfillmentState = 'Failed'
        message = response['message']
   
    return close(
        fulfillmentState,
        {
            'contentType': 'PlainText',
            'content': message
        }
    )
    

def book_room(intent_request):
    check_in_date = try_ex(lambda: intent_request['currentIntent']['slots']['check_in_date'])
    check_out_date = try_ex(lambda: intent_request['currentIntent']['slots']['check_out_date'])
    room_type = try_ex(lambda: intent_request['currentIntent']['slots']['roomType'])
    room_quantity = try_ex(lambda: intent_request['currentIntent']['slots']['room_quantity'])
    email = intent_request['sessionAttributes']['userID']
    
    print('check_in_date: ', check_in_date)
    print('check_out_date: ', check_out_date)
    print('Room: ', room_type)
    print('Quantity: ', room_quantity)
    print('Email: ', email)
    
    if intent_request['invocationSource'] == 'DialogCodeHook':
        validation_result = validate_book_room(intent_request['currentIntent']['slots'])
        if not validation_result['isValid']:
            slots = intent_request['currentIntent']['slots']
            slots[validation_result['violatedSlot']] = None

            return elicit_slot(
                intent_request['currentIntent']['name'],
                slots,
                validation_result['violatedSlot'],
                validation_result['message']
            )

        return delegate(intent_request['currentIntent']['slots'])
        
    check_in_date = dateutil.parser.parse(check_in_date)
    check_in_date_year = check_in_date.year
    check_in_date_month = check_in_date.month
    check_in_date_day = check_in_date.day
    
    check_out_date = dateutil.parser.parse(check_out_date)
    check_out_date_year = check_out_date.year
    check_out_date_month = check_out_date.month
    check_out_date_day = check_out_date.day
    
    if len(str(check_in_date_day)) == 1:
        check_in_date_day = "0" + str(check_in_date_day)
    else:
        check_in_date_day = str(check_in_date_day)
    if len(str(check_in_date_month)) == 1:
        check_in_date_month = "0" + str(check_in_date_month)
    else:
        check_in_date_month = str(check_in_date_month)
    if len(str(check_out_date_day)) == 1:
        check_out_date_day = "0" + str(check_out_date_day)
    else:
        check_out_date_day = str(check_out_date_day)
    if len(str(check_out_date_month)) == 1:
        check_out_date_month = "0" + str(check_out_date_month)
    else:
        check_out_date_month = str(check_out_date_month)
        
    check_in_date = check_in_date_month + "-" + check_in_date_day + "-" + str(check_in_date_year)
    check_out_date = check_out_date_month + "-" + check_out_date_day + "-" + str(check_out_date_year)    
    
    room_quantity = safe_int(room_quantity)
    
    booking_data = {
        "user_id": email,
        "checkin_date": check_in_date,
        "checkout_date": check_out_date,
        "room_type": room_type,
        "rooms_qty": room_quantity
    }
    
    http = urllib3.PoolManager()
    res = http.request('POST', BOOK_ROOMS_API_ENDPOINT,
                 headers={'Content-Type': 'application/json'},
                 body=json.dumps(booking_data))
    print(res.data.decode('utf-8'))
    response = json.loads(res.data.decode('utf-8'))

    if response['success']:
        fulfillmentState = 'Fulfilled'
        message = response['message']
    else:
        fulfillmentState = 'Failed'
        message = response['message']
  
    return close(
        fulfillmentState,
        {
            'contentType': 'PlainText',
            'content': message
        }
    )
    
    

def book_tour(intent_request):
    tour_type = try_ex(lambda: intent_request['currentIntent']['slots']['tourType'])
    people = try_ex(lambda: intent_request['currentIntent']['slots']['people'])
    email = intent_request['sessionAttributes']['userID']
    
    print('Tour: ', tour_type)
    print('People: ', people)
    print('Email: ', email)

    if intent_request['invocationSource'] == 'DialogCodeHook':
        validation_result = validate_tour(intent_request['currentIntent']['slots'])
        if not validation_result['isValid']:
            slots = intent_request['currentIntent']['slots']
            slots[validation_result['violatedSlot']] = None

            return elicit_slot(
                intent_request['currentIntent']['name'],
                slots,
                validation_result['violatedSlot'],
                validation_result['message']
            )

        return delegate(intent_request['currentIntent']['slots'])

    people = safe_int(people)
    tour_data = {
                    "user": email,
                    "id": get_tour_id(tour_type),
                    "quantity": people
                }
    http = urllib3.PoolManager()
    res = http.request('POST', BOOK_TOUR_API_ENDPOINT,
                 headers={'Content-Type': 'application/json'},
                 body=json.dumps(tour_data))
    response = json.loads(res.data.decode('utf-8'))

    if response['success']:
        fulfillmentState = 'Fulfilled'
        message = response['message']
    else:
        fulfillmentState = 'Failed'
        message = response['message']

    return close(
        fulfillmentState,
        {
            'contentType': 'PlainText',
            'content': message
        }
    )



def dispatch(intent_request):
    user_id = intent_request['sessionAttributes']['userID']
    print("User: ", user_id)
    
    intent_name = intent_request['currentIntent']['name']
    
    if not user_id:
        if intent_name == 'Navigation':
            return navigation(intent_request)
        elif intent_name == 'RoomAvailability':
            return get_available_rooms(intent_request)    
        else:    
            return close(
                'Failed',
                {
                    'contentType': 'PlainText',
                    'content': 'You are not logged in! Kindly log in to use any service.'
                }
            )
    else:        
        if intent_name == 'BookTour':
            return book_tour(intent_request)
        elif intent_name == 'OrderMeal':
            return order_meal(intent_request)
        elif intent_name == 'Navigation':
            return navigation(intent_request)
        elif intent_name == 'RoomAvailability':
            return get_available_rooms(intent_request)
        elif intent_name == 'BookRoom':
                return book_room(intent_request)
    
    raise Exception('Intent with name ' + intent_name + ' not supported')



def lambda_handler(event, context):
    return dispatch(event)
