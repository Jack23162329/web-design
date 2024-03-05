from flask import Flask, jsonify, request
import requests
import unittest
import logging
import traceback


import database_helper

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
    if email != "":
        user_data = checkUserExist(email)
        if (user_data is None):
            password = data['password']
            # repwd = data['repwd']
            familyname = data['familyname']
            firstname = data['firstname']
            gender = data['gender']
            city = data['city']
            country = data['country']
            message = '[]'
            #check the type of the input data
            if (password != "") and (familyname != "") and (firstname != "") and (gender != "") and (city != "") and (country != ""):    
                if len(password) > 7 :
                    result = persistUsers(email, password, firstname, familyname, gender, city, country, message)
                    if result is True:
                        return jsonify({'success': True, 'message': "Successfully created a new user.😊"}) 
                else:
                    return jsonify({'success': False, 'message': "Password is at least 7 letters.😢"})
            else:
                return jsonify({'success': False, 'message': "Form data missing or incorrect type.💀"})
        else:
            return jsonify({'success': False, 'message': "User already exists.😒"})

# @app.route('/sign_up', methods =['POST'])
# def sign_up_invalidate_data():

    



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
    
@app.route('/contact/save', methods=['POST'])
def save_contact():
    data = request.get_json()
    if 'name' in data and 'number' in data:
        if len(data['name']) < 50 and len(data['number']) < 50:
            result = database_helper.save_contact(data['name'], data['number'])
            if (result == True):
                return jsonify({"msg": "Contact saved."}), 200
            else:
                return jsonify({"msg": "Something went wrong."}), 500
        else:
            return jsonify({"msg": "Not good data."}), 400
    else:
        return jsonify({"msg": "Not good data."}), 400


@app.route('/contact/find/<name>', methods=['GET'])
def find_contact(name):
    if name is not None:
        contacts = database_helper.get_contact(name)
        if contacts is not None:
            if len(contacts) == False:
                return jsonify([]), 404
            else:
                return jsonify(contacts), 200
        else:
            return jsonify([]), 404


if __name__ == '__main__':
    
    app.run(debug=True)
