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
#post users
def Insert_user_into_users(email, password, firstname, familyname, gender, city, country):
   
    # print(email, password, firstname, gender, country, city) 
    get_db().execute('insert into users values (?, ?, ?, ?, ?, ?, ?)', [email, password, familyname, firstname, gender, city, country])
    get_db().commit()
    return True

def validemail(email):
    good_email = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if re.match(good_email, email):
        return True
    return False

#get user data by email
def Get_email_from_users(email):  #talbe: users
    print(email)
    cursor = get_db().execute('select * from users where email = ?', [email])
    rows = cursor.fetchone()
    #this method retrieves the nesxt row of a query reslt set 
    # and returns a single sequence
    cursor.close()
    if rows:
        result = {
            'email': rows[0],
            'password': rows[1],
            'familyname': rows[2],
            'fitstname': rows[3],
            'gender': rows[4],
            'city': rows[5],
            'country': rows[6],
            # 'messages': rows[7]
        }
        return result
    return None

def Update_password_from_users(email, newpassword):
    cursor = get_db().execute('UPDATE users SET password = ? WHERE email = ?', [newpassword, email])
    get_db().commit()
    cursor.close()
    return True

#valid the token in the user log in
def Get_token_from_loggedinusers(token):
    cursor = get_db().execute('select * from loggedinusers where token = ?', [token])
    row = cursor.fetchone()
    if row is not None:
        cursor.close()
        return True
    return False

#Signin
def Insert_Data_into_loggedinusers(email, token):
    print(email, token)
    get_db().execute('insert into loggedinusers values (?, ?)', [email, token])
    get_db().commit()
    return True

#get token and get the email
def get_token_from_loggedinusers(token):
    if token != "" and token is not None:
        cursor = get_db().execute('select * from loggedinusers where token = ?', [token])
        rows = cursor.fetchall()
        email = rows[-1][0]
        return email
    return None

#sendmessages
def Insert_Data_into_messages(token, toemail, message):
    get_db().execute('insert into messages (token, email, message) values (?, ?, ?)',[token, toemail, message])
    get_db().commit()
    return message

#get messages via email
def get_email_from_messages(email):
    cursor = get_db().execute('select * from messages where email = ?', [email])
    rows = cursor.fetchall()
    cursor.close()
    result = []
    for i in range(len(rows)):
        result.append(rows[i][3])
    return result
#removeUsers
def delete__token_from_loggedinusers(token):
    get_db().execute('delete from loggedinusers where token = ?', [token])
    get_db().commit
    return True










