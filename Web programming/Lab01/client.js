displayView = function(){
    // the code required to display a view
    }

window.onload = function(){
    var welcome = document.getElementById("welcomeview")
    var profile = document.getElementById("profileview")
    var token = localStorage.getItem("token")
    

    if(token){
        document.body.innerHTML = profile.innerHTML
        displaypage()
        
    }else{
        document.body.innerHTML = welcome.innerHTML
    }
    // var profile = document.getElementById("welcomeview")
    //code that is executed as the page is loaded.
    //You shall put your own custom code here.
    //window.alert() is not allowed to be used in your implementation.
    // window.alert("Hello TDDD97!")
    
}
function attachTab(){
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
function validation(formData){
    var password = formData.s_password.value
    var confirm_password = formData.c_password.value
    
    console.log(password, confirm_password)
    var message = document.getElementById("message")
    var signup = document.getElementById("signup")

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

            message.textContent = " "
            signup.textContent = signupvalid.message
            signup.style.color = "blue"
        }
        else{

            signup.textContent = signupvalid.message
            signup.style.color = "red"
        }
        
    }
    else{
        message.textContent = "Password don't match"
        message.style.backgroundColor = "#ff4d4d"
    }
}
// sign-in------------------------------------------
function signin(formData){

    event.preventDefault()
    var profile = document.getElementById("profileview")
    var signup = document.getElementById("signup")
    var email = formData.email.value
    var password = formData.password.value
    var sign_in = serverstub.signIn(email, password)

    if(sign_in.success === true){

        console.log(sign_in.data, sign_in.message)
        localStorage.setItem("token", sign_in.data)
        displaypage()

    }
    else{
        signup.textContent = sign_in.message
        signup.style.color = "red"
    }
}
function displaypage(){
    var profile = document.getElementById("profileview")
    document.body.innerHTML = profile.innerHTML 
    displayHometab()
    displayaccountpage()
    attachTab()
}
function displayaccountpage(){
    
    var visibility = document.getElementById("icon")
    visibility.addEventListener("click", togglevisibility)
    
    var visibility_1 = document.getElementById("icon-2")
    visibility_1.addEventListener("click", togglevisibility_1)
    
    var visibility_2 = document.getElementById("icon-3")
    visibility_2.addEventListener("click", togglevisibility_2)
    
    var bye_bye = document.getElementById("signout")
    bye_bye.addEventListener("click", signout)
}

function displayHometab(){
    
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
        
    }
}

function signout(){
        var welcome = document.getElementById("welcomeview")
        var token = localStorage.getItem("token")
        localStorage.removeItem("token")
        console.log(token)
        var sign_out = serverstub.signOut(token)

        if(sign_out.success === true){
            document.body.innerHTML = welcome.innerHTML
            message.textContent = sign_out.message
        }else{
            document.body.innerHTML = profile.innerHTML
        }        
    }

function changePassword(formData){
    var oldPassword = formData.oldpassword.value
    var newPassword = formData.newpassword.value
    var confirm_password = formData.confirmpassword.value

    var mistake = document.getElementById("mistake")
    var token = localStorage.getItem("token")
    
    
    
    if(newPassword != oldPassword){
        if (newPassword == confirm_password){
            const changePassword = serverstub.changePassword(token, oldPassword, newPassword)
            if(changePassword.success === true){
                mistake.textContent = changePassword.message
            }
            else{
                mistake.textContent = changePassword.message
            }
        }else{
            mistake.textContent = "New Password don't match"
        }
    }else{
        mistake.textContent = "can't change to same password"
    }
    


}

function showmessage(formData){
    var text = document.getElementById("textarea")
    var output = document.getElementById("output_wall")
    // var token = localStorage.getItem("token")

    

    // const Post = serverstub.postMessage(token, text)
    
    
    // if (Post.success === true && text != ""){
        console.log(text)
        
        output.innerHTML = text.value + output.innerHTML
        
    // }
    // else{
    //     console.log('Failed to post message:',Post.message )
    // }
    
}
function togglevisibility(){
    const oldpassword = document.getElementById("oldpassword")
    if (oldpassword.type === "password"){
        oldpassword.type = "text"
    }else{
        oldpassword.type = "password"
    }
}
function togglevisibility_1(){
    const oldpassword = document.getElementById("newpassword")
    if (oldpassword.type === "password"){
        oldpassword.type = "text"
    }else{
        oldpassword.type = "password"
    }
}
function togglevisibility_2(){
    const oldpassword = document.getElementById("confirmpassword")
    if (oldpassword.type === "password"){
        oldpassword.type = "text"
    }else{
        oldpassword.type = "password"
    }
}

