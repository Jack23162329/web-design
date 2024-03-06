# SQLite : database handler, to save and giving informations
import sqlite3
import re
# Flask : Light-weight web development framework
from flask import g


DATABASE_URI = "database.db"

def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)
    return db

def disconnect_db():
    db = getattr(g, 'db', None)
    if db is not None:
        g.db.close()
        g.db = None

def post_users(email, password, firstname, familyname, gender, city, country, message):
    get_db().execute('insert into users values (?, ?, ?, ?, ?, ?, ?, ?)', [email, password, familyname, firstname, gender, city, country, message])
    get_db().commit()
    return True

def validemail(email):
    good_email = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if re.match(good_email, email):
        return True
    return False

def getUserDataByEmail(email):  #talbe: users
    cursor = get_db().execute('select * from users where email = ?', [email])
    rows = cursor.fetchone()
    #this method retrieves the nesxt row of a query reslt set 
    # and returns a single sequence
    # cursor.close()
    if rows:
        result = {
            'email': rows[0],
            'password': rows[1],
            'familyname': rows[2],
            'fitstname': rows[3],
            'gender': rows[4],
            'city': rows[5],
            'country': rows[6],
            'message': rows[7]
        }
        return result
    return None

def changePassword(email, newpassword):
    cursor = get_db().execute('UPDATE users SET password = ? WHERE email = ?', [newpassword, email])
    get_db().commit()
    cursor.close()
    return True

def checkTokenExist(token):
    cursor = get_db().execute('select * from loggedinusers where token = ?', [token])
    row = cursor.fetchone()
    if row is not None:
        cursor.close()
        return True
    return False

def persisLoggedInUsers(email, token):
    print(email)
    get_db().execute('insert into loggedinusers values (?, ?)', [email, token])
    get_db().commit()
    return True

def tokenToEmail(token):
    if token != "" and token is not None:
        cursor = get_db().execute('select * from loggedinusers where token = ?', [token])
        rows = cursor.fetchall()
        email = rows[-1][0]
        return email
    return None

#table: loggedinusers
def getUserDatabyEmail_loggedin(token):
    cursor = get_db().execute("select * from loggedinusers where token = ?", [token])
    rows = cursor.fetchall()[0]
    cursor.close()
    return {'email': rows[0], 'token': rows[1]}


def post_message(email, message):
    cursor = get_db().execute('UPDATE users SET email = ? where messages = ?',[email, message])
    get_db().commit()
    cursor.close()
    return message

















# def save_contact(name, number):
#     try:
#         get_db().execute("insert into contact values(?,?);", [name, number])
#         get_db().commit()
#         return True
#     except:
#         return False

# def get_contact(name):
#     cursor = get_db().execute("select * from contact where name like ?", [name])
#     rows = cursor.fetchall()
#     cursor.close()
#     result = []
#     for index in range(len(rows)):
#         result.append({'name':rows[index][0], 'number':rows[index][1]})
#     return result


