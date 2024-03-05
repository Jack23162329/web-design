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


def persistUsers(email, password, firstname, familyname, gender, city, country,message):
    return database_helper.post_users(email, password, firstname, familyname, gender, city, country, message) 


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
                message = '[]'
                #check the type of the input data
                if (password != "" and password is not None) and (familyname != "" and familyname is not None) and (firstname != ""and firstname is not None) and (gender != ""and gender is not None) and (city != ""and city is not None) and (country != ""and country is not None):    
                    if len(password) > 7:
                        result = persistUsers(email, password, firstname, familyname, gender, city, country, message)
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

# @app.route('/sign_in', methods = ['POST'])
# def Sign_in():
#     data = request.get_json()
#     username = data['username']
#     passwords = data['password']


#     if (passwords == "" and passwords is None):
#         return jsonify({'success': False, 'message': "Can't input emptyp passwords"})
    
#     user_data = checkUserExist(username)
#     if user_data:
#         if user_data['password'] == passwords:
#             letters = "abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
#             token = ''
#             for i in range(0, 36):
#                 token += letters[randint(0, len(letters) - 1)]
            
#             result =  database_helper.persisLoggedInUsers(username, token)
#             if result is True:
#                 return jsonify({"success": True, 'message': "User successfully singed in😘"})
#     return jsonify({'success': False, 'message': "Wrong Username or Password"})


@app.route('/get_user_data_by_email', methods =['POST'])
def getUserDataByEmail():
    data = request.get_json()
    email = data['email']
    token = data['token']
    
    # check this user logged in
    loggedIn = database_helper.checkTokenExist(token)
    if loggedIn:
        # get user data
        user_data = database_helper.getUserDataByEmail(email)
        if user_data is not None:
            return jsonify({'success': 1, 'message': "User data retrieved.", 'data': user_data})
        return jsonify({'success': False, 'message': "No such user."})
    return jsonify({'success': False, 'message': "You are not signed in."})
    
# 


if __name__ == '__main__':
    
    app.run(debug=True)
