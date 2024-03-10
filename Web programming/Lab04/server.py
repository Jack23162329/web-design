from flask import Flask, jsonify, request
from random import randint
# from geventwebsocket.exceptions import WebSocketError
# from gevent.pywsgi import WSGIServer
# from geventwebsocket.handler import WebSocketHandler
from flask_sock import Sock
import json
import ssl


import database_helper
#inorder to get the fuction inside it

sockets = {}
app = Flask(__name__)
sock = Sock(app)
app.debug = True

#  to avoid same email enroll multiple times
@sock.route('/profileview')
def socket_connect(ws):
    print(sockets)
    while True:
        # print("hello darling")
        token = ws.receive()
        print("lets go: " + token)
        email = database_helper.get_email_from_loggedinusers(token)
        if email:
            sockets[email] = ws
            print(sockets)
            print("email added in ws")
        else:
            print("email not found")


@app.teardown_request
def after_request(exception):
    database_helper.disconnect_db()
    
@app.route('/')
@app.route('/client_html')
def welcomeview():
    return app.send_static_file("client.html")

@app.route('/sign_up', methods=['POST'])
def sign_up():
    data = request.get_json()
    email = data['email']
    # if user not exists
    if email != "" and email is not None:
        if database_helper.validemail(email):
            user_data = database_helper.Get_user_from_users(email)
            if (user_data is None):
                password = data['password']
                firstname = data['firstname']
                familyname = data['familyname']
                gender = data['gender']
                city = data['city']
                country = data['country']
                #check the type of the input data
                if (password != "" and password is not None) and (familyname != "" and familyname is not None) and (firstname != ""and firstname is not None) and (gender != ""and gender is not None) and (city != ""and city is not None) and (country != ""and country is not None):    
                    if len(password) >= 7:
                        result = database_helper.Insert_user_into_users(email, password, firstname, familyname, gender, city, country) 
                        #pose new user to database
                        # user = database_helper.Get_user_from_users(email)
                        if result is True:
                            return jsonify({'success': True, 'message': "Successfully created a new user.😊"}) ,201
                    else:
                        return jsonify({'success': False, 'message': "Password is at least 7 letters.😢"}) ,400
                else:
                    return jsonify({'success': False, 'message': "Form data missing or incorrect type.💀"}) ,500
            else:
                return jsonify({'success': False, 'message': "User already exists.😒"}) ,409
        else:
            return jsonify({'success': False, 'message': "input invalid email address🙃"}) ,400
    else:
        return jsonify({'success': False, 'message': "Passwords don't match :( "}), 400

@app.route('/sign_in', methods = ['POST'])
def sign_in():
    data = request.get_json()
    username = data['email']
    passwords = data['password']


    # if (passwords == "" or passwords is None):
    #     return jsonify({'success': False, 'message': "Can't input empty passwords"})
    
    
    if database_helper.validemail(username):
        user_data = database_helper.Get_user_from_users(username)
        if user_data is not None:
            if user_data['password'] == passwords:
                letters = "abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
                token = ''
                for i in range(0, 36):
                    token += letters[randint(0, len(letters) - 1)]
                
                result =  database_helper.Insert_Data_into_loggedinusers(username, token)
                if result is True:
                    return jsonify({"success": True, 'message': "User successfully singed in😘", 'data': token}), 200
                else:
                    return "", 500
            else:
                return jsonify({"success": False, 'message': "Wrong Username or Password"}), 401
        
        else:
            return jsonify({'success': False, 'message': "No such User"}), 404
    else:
        return "", 400


@app.route('/change_password', methods = ['PUT'])
def change_password():
    data = request.get_json()
    token = request.headers.get('Authorization')
    oldPassword = data['oldpassword']
    newpassword = data['newpassword']
    confirmpassword = data['confirm_password']
    if(not token or not oldPassword or not newpassword):
        return jsonify({'success': False, 'message': "Missing required fields"})
    token_exist = database_helper.Get_token_from_loggedinusers(token)
    if token_exist:
        email = database_helper.get_email_from_loggedinusers(token)
        user_data = database_helper.Get_user_from_users(email)
        
        if user_data['password'] == oldPassword:
            if newpassword == confirmpassword:
                if newpassword != oldPassword:
                    database_helper.Update_password_from_users(email, newpassword )
                    return jsonify({'success': True, 'message': "Password changed."}), 200
                else:
                    return jsonify({'success': False,'message': "can't change to same password"}), 400
            else:
                return jsonify({'success':False,'message': "confirm passwords don't match"}), 400
        else:
            return jsonify({'success':False, 'message': "wrong passwords."}) ,400
    return jsonify({'success': False, 'message': "u are not log in."}) , 401


@app.route('/get_user_data_by_token', methods = ['GET'])
def getUserDatabyToken():
    token = request.headers.get('Authorization')
    if (not token):
        return jsonify({'success': False,'message': "token doesn't exist💀"}), 401
    loggin = database_helper.Get_token_from_loggedinusers(token)
    if(loggin):
        email = database_helper.get_email_from_loggedinusers(token)
        if email:
            user_data = database_helper.Get_user_from_users(email)
            return jsonify({'success':True, 'message': "get data successfully","data" : user_data}), 200
        else:
            return "", 401
    else:
        return jsonify({'success':False,'message':"invalid token ~~ pls sign_up first!"}), 404
    
@app.route('/get_user_data_by_email/<email>', methods =['GET'])
def getUserDatabyemail(email): #cuz URL change with email, so we have to get the email inorder to access into correct URL
    token = request.headers.get('Authorization')

    LoggedIn = database_helper.Get_token_from_loggedinusers(token)
    # check this user logged in
    if (LoggedIn):
       
        result = database_helper.Get_user_from_users(email)
        #then we check the input email is correct or not to get the data
        if result is not None:
            return jsonify({'success': True, 'message': "successfully retrieved user data",'data': result}), 200
        return jsonify({'success': False, 'message': "User doesn't exist😢"}), 404
    return jsonify({'success':False,'message': "You are not log in ~~"}), 401

@app.route('/post_message', methods = ['POST'])
def Post_message():
    data = request.get_json()
    token = request.headers.get("Authorization")
    if token is None:
        return jsonify({'success': False, 'message':"incorrect token"}), 400
    toEmail = data['email']
    if toEmail is None:
        return jsonify({'success': False, 'message':"Empty not found"}), 400
    message = data['message']
    if message is None:
        return jsonify({'success': False, 'message':"Empty messages"}), 400
    
    fromEmail = database_helper.get_email_from_loggedinusers(token)
    # print(fromEmail,toEmail);
    
    LoggedIn = database_helper.Get_token_from_loggedinusers(token)

    
    if LoggedIn:
        if (toEmail == None):
            toEmail = fromEmail;
        User_data = database_helper.Get_user_from_users(toEmail)
        if User_data:
            send_message = database_helper.Insert_Data_into_messages(fromEmail, toEmail, message)
            if send_message:
                # messages = database_helper.get_message(toEmail)
                return jsonify({'success':True, 'message': "send message successfully",'messages': send_message}), 201
        return jsonify({'success': False, 'message': "the receiver isn't exist"}), 404
    return jsonify({'success': False, 'message': "You are not log in ~~"}), 401

@app.route('/get_user_messages_by_token',methods = ['GET'])
def getusermessagesbytoken():
    token = request.headers.get("Authorization")
    if token is None:
        return jsonify({'success': False, 'message': "token can't be None"})
    LoggedIn = database_helper.Get_token_from_loggedinusers(token)

    if LoggedIn:
        email = database_helper.get_email_from_loggedinusers(token)
        User_data = database_helper.get_message_from_email(email)
        return jsonify({'success': True, 'message':'Successfully retrieved user messages !', 'messages': User_data}), 200
    else:
        return jsonify({'success': False, 'message': "You are not log in ~~"}), 401
    
@app.route('/get_user_messages_by_email/<email>', methods = ['GET'])
def getusermessagebyemail(email):
    token = request.headers.get("Authorization")
    LoggedIn = database_helper.Get_token_from_loggedinusers(token)
    if LoggedIn:
        exist_user = database_helper.Get_user_from_users(email)
        if exist_user:
            User_message = database_helper.get_message_from_email(email)
            return jsonify({'success': True, 'message': "successfully retrieved user messages !", 'messages': User_message}), 200
        else:
            return jsonify({'success': False,'message': "User doesn't exist"}), 404
    return jsonify({'success': False, 'message': "You are not log in ~~"}), 401

@app.route('/sign_out', methods = ['DELETE'])
def Sign_out():
    # data = request.get_json()
    token = request.headers.get("Authorization")

    if token is None:
        return jsonify({'success': False, 'message': "Empty  token"})
    
    LoggedIn = database_helper.Get_token_from_loggedinusers(token)
    if LoggedIn:
        email = database_helper.get_email_from_loggedinusers(token)
        if (email != None):
            if (email in sockets):
                del sockets[email]
            exist_user = database_helper.Get_user_from_users(email)
            if exist_user:
                if(database_helper.delete_user_from_loggedinusers(email)):
                    return jsonify({'success': True, 'message': "Sign out successfully😊"}), 200
                else:
                    return "" ,500
            else:
                return jsonify({'success': False,'message': "User doesn't exist"}), 400
        return "" ,401
    return jsonify({'success': False,'message':"You are not log in ~~"}), 401




if __name__ == '__main__':
    # http_server = WSGIServer(('',5000),app,handler_class = WebSocketHandler)
    # http_server.serve_forever()
    app.run()
