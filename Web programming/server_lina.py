from flask import Flask, jsonify, request
from random import randint
from flask_sqlalchemy import SQLAlchemy
from flask_sockets import Sockets
import json
import sys

import database_handler

app = Flask(__name__)
app.debug = True
sockets = Sockets(app)

def checkUserExist(email):
    data = database_handler.getUserDataByEmail(email)
    if data == None:
        return None
    return data

def persistLoggedInUsers(email, token):
    result = database_handler.add_loggedinuser(email, token)
    return result

def persistUsers(email, password, firstname, familyname, gender, city, country, message):
    return database_handler.add_user(email, password, firstname, familyname, gender, city, country, message) 

#check the numbers of letters of the password
def validSignin(password):
    if len(password) < 7:
        return False
    return True



@sockets.route('/handle_login')
def handle_login(ws):
    while not ws.closed:
        message = ws.receive()
        if message:
            print("hi")
            

@app.teardown_request
def after_request(exception):
    database_handler.disconnect_db()

@app.route('/')
def welcomeview():
    return app.send_static_file("client.html")

@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data['email']
    password = data['password']

    #password validation
    correct = validSignin(password)
    if not correct:
        return jsonify({'success': False, 'message': "The password is at least 7 letters."})

    #get user data
    user_data = checkUserExist(email)
    if user_data is not None:
        #confirm the password is correct
        if user_data['password'] == password:            
            #generate a token
            letters = 'abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
            token = ''
            for i in range(0, 36):
                token += letters[randint(0,len(letters) - 1)]
            # add loggined user data to db
            result = persistLoggedInUsers(email, token)
            if result is True:
                return jsonify({'success': 1, 'message': "Successfully signed in.", 'data': token})
    return jsonify({'success': 0, 'message': "Wrong username or password."})

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data['email']

    # if user not exists
    if email != "":
        user_data = checkUserExist(email)
        if (user_data is None):
            password = data['password']
            repwd = data['repwd']
            familyname = data['familyname']
            firstname = data['firstname']
            gender = data['gender']
            city = data['city']
            country = data['country']
            message = '[]'
            #check the type of the input data
            if (password != "") and (repwd != "") and (familyname != "") and (firstname != "") and (gender != "") and (city != "") and (country != ""):    
                if len(password) > 7 and len(repwd) > 7:
                    if password == repwd:
                        result = persistUsers(email, password, firstname, familyname, gender, city, country, message)
                        if result is True:
                            return jsonify({'success': 1, 'message': "Successfully created a new user."}) 
                    else:
                        return jsonify({'success': 1, 'message': "password and repeat password should be equal."}) 
                else:
                    return jsonify({'success': 0, 'message': "Password is at least 7 letters."})
            else:
                return jsonify({'success': 0, 'message': "Form data missing or incorrect type."})
        else:
            return jsonify({'success': 0, 'message': "User already exists."})
               

@app.route('/signout', methods=['POST'])
def signout():
    data = request.get_json()
    token = data['token']
    
    # check this user logged in
    loggedIn = database_handler.checkTokenExist(token)
    if loggedIn:
        result = database_handler.deleteLoggedinUserByToken(token)
        return jsonify({'success': 1, 'message': "Successfully signed out."})
    return jsonify({'success': 0, 'message': "You are not signed in."})

@app.route('/getUserDataByToken', methods=['POST'])
def getUserDataByToken():
    data = request.get_json()
    token = data['token']
    loggedIn = database_handler.checkTokenExist(token)
    if loggedIn:
        email = database_handler.tokenToEmail(token)
        user_data = database_handler.getUserDataByEmail(email)
        if user_data is not None:
            user_data['token'] = token
            return jsonify({'success': 1, 'message': "User data retrieved.", 'data': user_data})
        return jsonify({'success': 0,'message': "No such user."})
    return jsonify({'success': 0, 'message': "You are not signed in."})

@app.route('/getUserDataByEmail', methods=['POST'])
def getUserDataByEmail():
    data = request.get_json()
    email = data['email']
    token = data['token']
    
    # check this user logged in
    loggedIn = database_handler.checkTokenExist(token)
    if loggedIn:
        # get user data
        user_data = database_handler.getUserDataByEmail(email)
        if user_data is not None:
            return jsonify({'success': 1, 'message': "User data retrieved.", 'data': user_data})
        return jsonify({'success': 0, 'message': "No such user."})
    return jsonify({'success': 0, 'message': "You are not signed in."})
        
@app.route('/getUserMessagesByToken', methods=['POST'])
def getUserMessagesByToken():
    data = request.get_json()
    token = data['token']
    
    # check this user logged in
    loggedIn = database_handler.checkTokenExist(token)
    if loggedIn:
        # email = database_handler.tokenToEmail(token)
        user_data = database_handler.getUserMessagesByToken(token)
        if user_data is not None:
            return jsonify({'success': 1, 'message': "User messages retrieved.", 'data': user_data['messages']})
        return jsonify({'success': 0,'message': "No such user."})
    else:
        return jsonify({'success': 0, 'message': "You are not signed in."})
        
@app.route('/getUserMessagesByEmail', methods=['POST'])
def getUserMessagesByEmail():
    data = request.get_json()
    token = data['token']
    email = data['email']
    
    # check this user logged in
    loggedIn = database_handler.checkTokenExist(token)
    if loggedIn:
        user_data = database_handler.getUserMessagesByEmail(email)
        print(user_data)
        if user_data is not None:
            return jsonify({'success': 1, 'message': "User messages retrieved.", 'data': user_data['messages']})
        return jsonify({'success': 0,'message': "No such user."})
    else:
        return jsonify({'success': 0, 'message': "You are not signed in."})

@app.route('/postMessage', methods=['POST'])
def postMessage():
    data = request.get_json()
    token = data['token']
    toEmail = data['toEmail']
    content = data['content']
    
    fromEmail = database_handler.tokenToEmail(token)
    if fromEmail is not None:
        if toEmail == "":
            toEmail = fromEmail

        # get recipient user data
        recipient = database_handler.getUserMessagesByEmail(toEmail)
        if recipient is not None:
            # add new content into recipient messages
            messages = json.loads(recipient['messages'])
            message = {'writer':fromEmail, 'content':content}
            messages.append(message)
            messages = json.dumps(messages)
            # update recipient messages data in db
            database_handler.postMessage(toEmail, messages)
            return jsonify({'success': 0, 'message': "Message posted."})
        return jsonify({'success': 0,'message': "No such user."})
    return jsonify({'success': 0,'message': "You are not signed in."})
        

@app.route('/changePassword', methods=['POST'])
def changePassword():
    data = request.get_json()
    token = data['token']
    oldPassword = data['oldPassword']
    newPassword = data['newPassword']
    repassword = data['rePassword']
    
    # validate the format
    if len(oldPassword) < 7 or len(newPassword) < 7 or len(repassword) < 7:
        return jsonify({'success': 0, 'message': "The password is at least 7 characters."})
    elif newPassword != repassword:
        return jsonify({'success': 0, 'message': "Both password fields must contain the same string."})
    else:
        # pass the validation
        # check the token exists
        token_exist = database_handler.checkTokenExist(token)
        if token_exist:
            email = database_handler.tokenToEmail(token)
            user_data = database_handler.getUserDataByEmail(email)
            # check the old pw is correct
            if user_data['password'] == oldPassword:
                # change password by database
                database_handler.changePassword(email, newPassword)
                return jsonify({'success': 1, 'message': "Password changed."})
            return jsonify({ "success": 0, "message": "Wrong password."})
        return jsonify({ "success": 0, "message": "You are not logged in."})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
