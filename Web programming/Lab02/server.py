from flask import Flask, jsonify, request
from random import randint
import unittest
import logging
import traceback


import database_helper
#inorder to get the fuction inside it
app = Flask(__name__)


#  to avoid same email enroll multiple times
def checkUserExist(email):
    data = database_helper.getUserDataByEmail(email)
    if data == None:
        return None
    return data


def persistUsers(email, password, firstname, familyname, gender, city, country):
    return database_helper.post_users(email, password, firstname, familyname, gender, city, country) 


@app.teardown_request
def after_request(exception):
    database_helper.disconnect_db()
    
@app.route('/')
def welcomeview():
    return app.send_static_file("client.html")

@app.route('/sign_up', methods=['POST'])
def sign_up():
    data = request.get_json()
    email = data['email']

    # if user not exists
    if email != "" and email is not None:
        if database_helper.validemail(email):
            user_data = checkUserExist(email)
            if (user_data is None):
                password = data['password']
                # repwd = data['repwd']
                firstname = data['firstname']
                familyname = data['familyname']
                gender = data['gender']
                city = data['city']
                country = data['country']
                # message = '[]'
                #check the type of the input data
                if (password != "" and password is not None) and (familyname != "" and familyname is not None) and (firstname != ""and firstname is not None) and (gender != ""and gender is not None) and (city != ""and city is not None) and (country != ""and country is not None):    
                    if len(password) > 7:
                        result = persistUsers(email, password, firstname, familyname, gender, city, country)
                        #pose new user to database
                        if result is True:
                            return jsonify({'success': True, 'message': "Successfully created a new user.😊"}) ,200
                    else:
                        return jsonify({'success': False, 'message': "Password is at least 7 letters.😢"}) 
                else:
                    return jsonify({'success': False, 'message': "Form data missing or incorrect type.💀"})
            else:
                return jsonify({'success': False, 'message': "User already exists.😒"}) 
        else:
            return jsonify({'success': False, 'message': "input invalid email address🙃"})
    else:
        return jsonify({'success': False, 'message': "no input email detected :( "})

@app.route('/sign_in', methods = ['POST'])
def sign_in():
    data = request.get_json()
    username = data['username']
    passwords = data['password']


    if (passwords == "" or passwords is None):
        return jsonify({'success': False, 'message': "Can't input empty passwords"})
    
    user_data = checkUserExist(username)
    if user_data is not None:
        if user_data['password'] == passwords:
            letters = "abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
            token = ''
            for i in range(0, 36):
                token += letters[randint(0, len(letters) - 1)]
            
            result =  database_helper.persisLoggedInUsers(username, token)
            if result is True:
                return jsonify({"success": True, 'message': "User successfully singed in😘", 'data': token})
        else:
            return jsonify({"success": False, 'message': "passwords are not match"})
    
    else:
        return jsonify({'success': False, 'message': "Wrong Username or Password"})


@app.route('/change_password', methods = ['PUT'])
def change_password():
    data = request.get_json()
    token = request.headers.get('Authorization')
    oldPassword = data['oldpassword']
    newpassword = data['newpassword']
    if(not token or not oldPassword or not newpassword):
        return jsonify({'success': False, 'message': "Missing required fields"})
    token_exist = database_helper.checkTokenExist(token)
    if token_exist:
        email = database_helper.tokenToEmail(token)
        user_data = database_helper.getUserDataByEmail(email)
        
        if user_data['password'] == oldPassword:
            database_helper.changePassword(email, newpassword )
            return jsonify({'success': True, 'message': "Password changed."})
        else:
            return jsonify({'success':False, 'message': "wrong passwords."})
    return jsonify({'success': False, 'message': "u are not log in."})


@app.route('/get_user_data_by_token', methods = ['GET'])
def getUserDatabyToken():
    token = request.headers.get('Authorization')
    if (not token):
        return jsonify({'success': False,'message': "token doesn't exist💀"})
    loggin = database_helper.checkTokenExist(token)
    if(loggin):
        email = database_helper.tokenToEmail(token)
        if email:
            user_data = database_helper.getUserDataByEmail(email)
            return jsonify({'sueecss':True, 'message': "get data successfully","data" : user_data})
    else:
        return jsonify({'success':False,'message':"invalid token ~~ pls sign_up first!"})
    
@app.route('/get_user_data_by_email/<email>', methods =['GET'])
def getUserDatabyemail(email): #cuz URL change with email, so we have to get the email inorder to access into correct URL
    token = request.headers.get('Authorization')

    LoggedIn = database_helper.checkTokenExist(token)
    # check this user logged in
    if (LoggedIn):
       
        result = database_helper.getUserDataByEmail(email)
        #then we check the input email is correct or not to get the data
        if result is not None:
            return jsonify({'success': True, 'message': "successfully retrieved user data",'data': result})
        return jsonify({'success': False, 'message': "email not found ~~ pls sign_up first!"})
    return jsonify({'success':False,'message': "You are not log in ~~"})

@app.route('/post_message', methods = ['POST'])
def Post_message():
    data = request.get_json()
    token = request.headers.get("Authorization")
    if token is None:
        return jsonify({'success': False, 'message':"Token shouldn't be None"})
    email_recipient = data['email']
    if email_recipient is None:
        return jsonify({'success': False, 'message':"Email shouldn't be None"})
    message = data['message']
    if message is None:
        return jsonify({'success': False, 'message':"Message shouldn't be None"})
    LoggedIn = database_helper.checkTokenExist(token)

    
    if LoggedIn:
        User_data = database_helper.getUserDataByEmail(email_recipient)
        if User_data:
            send_message = database_helper.post_message(token, email_recipient, message)
            
            if send_message:
                # messages = database_helper.get_message(email_recipient)
                return jsonify({'success':True, 'message': "send message successfully",'messages': send_message})
        return jsonify({'success': False, 'message': "the receiver isn't exist"})
    return jsonify({'success': False, 'message': "You are not log in ~~"})

@app.route('/get_user_messages_by_token',methods = ['GET'])
def getusermessagesbytoken():
    token = request.headers.get("Authorization")
    if token is None:
        return jsonify({'success': False, 'message': "token can't be None"})
    LoggedIn = database_helper.checkTokenExist(token)

    if LoggedIn:
        email = database_helper.tokenToEmail(token)
        User_data = database_helper.get_message(email)
        return jsonify({'success': True, 'message':'Successfully retrieved user messages !', 'messages': User_data})
    else:
        return jsonify({'success': False, 'message': "You are not log in ~~"})
    
@app.route('/get_user_messages_by_email/<email>', methods = ['GET'])
def getusermessagebyemail(email):
    token = request.headers.get("Authorization")
    if token is None:
        return jsonify({'success': False, 'message': "token can't be None"})
    if email is None:
        return jsonify({'success': False, 'message': "Email can't be None"})
    LoggedIn = database_helper.checkTokenExist(token)
    if LoggedIn:
        exist_user = database_helper.getUserDataByEmail(email)
        if exist_user:
            User_message = database_helper.get_message(email)
            return jsonify({'success': True, 'message': "successfully retrieved user messages !", 'messages': User_message})
        else:
            return jsonify({'success': False,'message': "User doesn't exist"})
    return jsonify({'success': False, 'message': "You are not log in ~~"})

@app.route('/sign_out', methods = ['DELETE'])
def Sign_out():
    token = request.headers.get("Authorization")
    if token is None:
        return jsonify({'success': False, 'message': "token can't be None"})
    
    LoggedIn = database_helper.checkTokenExist(token)
    if LoggedIn:
        email = database_helper.tokenToEmail(token)
        exist_user = database_helper.getUserDataByEmail(email)
        if exist_user:
            database_helper.removeUser(token)
            return jsonify({'success': True, 'message': "Successfully remove User!!"})
        else:
            return jsonify({'success': False,'message': "User doesn't exist"})
    return jsonify({'success': False,'message':"You are not log in ~~"})




if __name__ == '__main__':
    app.run(debug=True)
