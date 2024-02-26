// displayView = function(){
//     // the code required to display a view
//     }


// let userInfo;
let toEmail = null
let alertElement


window.onload = function()
{
    var token = localStorage.getItem("token")

    if(token){
        View("profileview")
        displaypage()
        
    }else{
        View("welcomeview")
    }
    // var profile = document.getElementById("welcomeview")
    //code that is executed as the page is loaded.
    //You shall put your own custom code here.
    //window.alert() is not allowed to be used in your implementation.
    // window.alert("Hello TDDD97!")

}
//inorder to get user information easier
function getData(token) 
{
    var userDataResponse = serverstub.getUserDataByToken(token)
    return userData = userDataResponse.data
}

//so that we don't have to type it everytime, make the code clear!
function View(name)
{
    var viewcontent = document.getElementById(name)
    document.body.innerHTML = viewcontent.innerHTML
}

// inorder to change different page by using the tab system
function attachTab()
{
    const tabs = document.querySelectorAll('[data-tab-target]')
        const tabContents = document.querySelectorAll('[data-tab-content]')
        
        tabs.forEach(tab => {
            tab.addEventListener('click', ()=>{
                const target = document.querySelector(tab.dataset.tabTarget)
                tabContents.forEach(tabContent => {
                    tabContent.classList.remove('active')
                 })
                tabs.forEach(tab => {
                    tab.classList.remove('active')
                 })
                tab.classList.add('active')
                target.classList.add('active')
            })
        })
        
}

function validation(formData)
{
    var password = formData.s_password.value
    var confirm_password = formData.c_password.value
    
    console.log(password, confirm_password)
    var message = document.getElementById("message")

    if(password == confirm_password){

        var email = formData.s_email.value
        var firstname = formData.name.value
        var familyname = formData.F_name.value
        var gender = formData.gender.value
        var city = formData.city.value
        var country = formData.Country.value

        var user = {
            'email': email,
            'password': password,
            'firstname': firstname,
            'familyname': familyname,
            'gender': gender,
            'city': city,
            'country': country,
          }
        console.log(user)
        // console.log(email,password, firstname, familyname, gender, city, country)
        // sign-up-------------------------------------------
        var signupvalid = serverstub.signUp(user)
        console.log(signupvalid)
        if(signupvalid.success === true){

            message.textContent = signupvalid.message
            message.style.backgroundColor = "white"
            setTimeout(function () {
                message.textContent = "";
                message.style.backgroundColor = ""
            }, 1500);
        }
        else{

            message.textContent = signupvalid.message
            message.style.backgroundColor = "red"
            setTimeout(function () {
                message.textContent = "";
                message.style.backgroundColor = ""
            }, 1500);
        }
        
    }
    else{
        message.textContent = "Password don't match"
        message.style.backgroundColor = "red"
        setTimeout(function () {
            message.textContent = "";
            message.style.backgroundColor = ""
        }, 1500);
    }
}
// sign-in------------------------------------------
function signin(formData)
{

    event.preventDefault()
    var message = document.getElementById("message")
    var email = formData.email.value
    var password = formData.password.value
    var sign_in = serverstub.signIn(email, password)

    if(sign_in.success === true){

        console.log(sign_in.data, sign_in.message)
        localStorage.setItem("token", sign_in.data)
        displaypage()

    }
    else{
        message.textContent = sign_in.message
        message.style.backgroundColor = "red"
        setTimeout(function () {
            message.textContent = "";
            message.style.backgroundColor = ""
        }, 1500);

    }
}
function displaypage()
{

    View("profileview")
    displayHometab()
    displayaccountpage()
    attachTab()
}

// let the page won't log out each time we refresh it~~
function displayaccountpage()
{
    
    var visibility = document.getElementById("icon")
    visibility.addEventListener("click", togglevisibility)
    
    var visibility_1 = document.getElementById("icon-2")
    visibility_1.addEventListener("click", togglevisibility_1)
    
    var visibility_2 = document.getElementById("icon-3")
    visibility_2.addEventListener("click", togglevisibility_2)
    
    var bye_bye = document.getElementById("signout")
    bye_bye.addEventListener("click", signout)
}

function displayHometab()
{
    
    var token = localStorage.getItem("token")
    var userDataResponse = serverstub.getUserDataByToken(token)
    
    var Name = document.getElementById("Name")
    var gender = document.getElementById("gender")
    var city = document.getElementById("city")
    var Country = document.getElementById("Country")
    var Email = document.getElementById("Email")

    if (userDataResponse.success === true){
        
        var userData = userDataResponse.data

        Name.textContent = userData.firstname +" "+ userData.familyname
        gender.textContent = userData.gender
        city.textContent = userData.city
        Country.textContent = userData.country
        Email.textContent = userData.email

    }else{
        return
    }
}

function signout()
{
        var token = localStorage.getItem("token")
        localStorage.removeItem("token")
        console.log(token)
        var sign_out = serverstub.signOut(token)

        if(sign_out.success === true){
            View("welcomeview")
            message.textContent = sign_out.message
            message.style.backgroundColor = "white"
            setTimeout(function () {
                message.textContent = "";
                message.style.backgroundColor = ""
                
            }, 1500);

        }else{
            View("profileview")
        }        
}
function alertforpassword(message)
{
    mistake = document.getElementById("mistake")
    if (message){
        mistake.textContent = message
        setTimeout(function () {
            mistake.textContent = "";
        }, 1500);
    }
    else{
        return
    }
}

// changing the password
function changePassword(formData)
{
    
    var oldPassword = formData.oldpassword.value
    var newPassword = formData.newpassword.value
    var confirm_password = formData.confirmpassword.value

    // inorder the show the wrong message
    // var mistake = document.getElementById("mistake")
    var token = localStorage.getItem("token")
    
    
    
    if(newPassword != oldPassword)
    {
        if (newPassword == confirm_password){
            const changePassword = serverstub.changePassword(token, oldPassword, newPassword)
            if(changePassword.success === true){
                alertforpassword(changePassword.message)
            }
            else{
                alertforpassword(changePassword.message)
            }
        }else{
            alertforpassword("New Password don't match")
        }
    }else{
        alertforpassword("can't change to same password")
    }
    


}

function uploadmessage(msgId)
{
    //get post message content
    let message = document.getElementById(msgId).value
    var token = localStorage.getItem("token")
    getData(token)
    
    if (message == "") {
        return
    }
    let email

    if (msgId === postOwnMessage) {
        email = userData.email
        console.log(email)

    }
    else {
        email = toEmail
    }

    let result = serverstub.postMessage(token, message, email)
    console.log(email)
    if (result.success === true) {
        console.log(result.message)
        document.getElementById(msgId).value = ""
    }
}


// const refresh = document.querySelector('.bottom4')
// refresh.addEventListener('click',() => {
//     refreshbottom()
// })

function refreshbottom(wallId, dare)
{
    var token = localStorage.getItem('token')
    getData(token)
    
    
    let email 
    if(dare == 'ownWall'){
        email = userData.email
        console.log("what")
    }
    else if(dare == 'otherWall'){
        email = toEmail;
        console.log("aaaa")
    }
    console.log(email,token)
    var result = serverstub.getUserMessagesByEmail(token, email)
    console.log(result.success)
    if(result.success === true) {
        var postarea = document.getElementById(wallId)
        removeAllChildElement(postarea)
        console.log("it work")
        var final_result = result.data
        for (i = 0; i < final_result.length; i++) {
            var container = document.createElement('div')
            container.className = "container"
            // for email
            var writer = document.createElement('p')
            writer.className = "writer"
            writer.innerHTML = final_result[i].writer
            container.appendChild(writer)
            // for messages
            var content = document.createElement('p')
            content.className = "content"
            content.innerHTML = final_result[i].content
            container.appendChild(content)
            postarea.appendChild(container)

            // 換行問題~~

        }
    }
}

function search_users(formData)
{
    event.preventDefault()
    var token = localStorage.getItem("token")
    var seeya = document.getElementById("contact")
    var useremail = formData.searching.value;
    console.log("input", useremail)
    const user = serverstub.getUserDataByEmail(token, useremail)
    console.log(user)
    var Name = document.getElementById("Name_other")
    var gender = document.getElementById("gender_other")
    var city = document.getElementById("city_other")
    var Country = document.getElementById("Country_other")
    var Email = document.getElementById("Email_other")
    if(user.success === true)
    {               
            var userData =user.data
            console.log(userData)
            Name.textContent = userData.firstname +" "+ userData.familyname
            gender.textContent = userData.gender
            city.textContent = userData.city
            Country.textContent = userData.country
            Email.textContent = userData.email
            toEmail = useremail
            var browseview = document.getElementById("otherWall")
            
            browseview.style.display = "block"
            seeya.style.display = "none"    
        
    }  
}


function removeAllChildElement(pElement) 
{
    while (pElement.firstChild) {
        pElement.removeChild(pElement.firstChild)
    }
}


// for the invisibility of the passwords

function togglevisibility()
{
    const oldpassword = document.getElementById("oldpassword")
    if (oldpassword.type === "password"){
        oldpassword.type = "text"
    }else{
        oldpassword.type = "password"
    }
}
function togglevisibility_1()
{
    const oldpassword = document.getElementById("newpassword")
    if (oldpassword.type === "password"){
        oldpassword.type = "text"
    }else{
        oldpassword.type = "password"
    }
}
function togglevisibility_2()
{
    const oldpassword = document.getElementById("confirmpassword")
    if (oldpassword.type === "password"){
        oldpassword.type = "text"
    }else{
        oldpassword.type = "password"
    }
}

