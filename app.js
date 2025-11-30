

const cl = console.log;

const blogContainer = document.getElementById('blogContainer')
const blogForm = document.getElementById('blogForm')
const titleControl = document.getElementById('title')
const contentControl = document.getElementById('content')
const userIdControl = document.getElementById('userId')
const addPostBtn = document.getElementById('addPostBtn')
const updatePostBtn = document.getElementById('updatePostBtn')
const loader = document.getElementById('loader')



let BASE_URL = "https://blog-task-85307-default-rtdb.firebaseio.com";

let BLOG_URL = `${BASE_URL}/blogs.json`;


function snackBar(title,icon){
    Swal.fire({
        title,
        icon,
        timer:1000
    })
}

function toggleSpinner(flag){
    if(flag===true){
        loader.classList.remove('d-none')
    }else{
        loader.classList.add('d-none')
    }
}

function objToArr(obj) {

    let arr = []

    for (const key in obj) {
       obj[key].id = key;
       arr.push(obj[key]) 
        
    }
    return arr
}

const createBlogs = (arr) =>{
 let result =arr.map(blog=>{
    return `<div class="card mb-3 shadow-lg bg-white rounded" id="${blog.id}">
                    <div class="card-header">
                        <h3 class="mb-0">${blog.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">${blog.content}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline btn-info"onClick = "onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-outline btn-warning"onClick = "onRemove(this)">Remove</button>
                    </div>
                 </div>`

 }).join('')

     blogContainer.innerHTML=result;
}


const makeApiCall = (URL,method,body) =>{
    toggleSpinner(true)

   let msgBody = body ? JSON.stringify(body):null;

    let obj = {
        method : method,
        body : msgBody,
        headers:{
            "Auth" : "Token From LS",
            "content-type" : "application/json"
        }
    }

    return fetch(URL,obj)
    .then(res=>{
        return res.json().then(data =>{
            if(!res.ok){
                let err = data.error || res.statusText ||`Something Went Wrong !!!`;
                throw new Error(err);
                
            }
            return data
        })
    })
    .finally(()=>{
        toggleSpinner(false);
    })

}


const fetchAllData=()=>{

    makeApiCall(BLOG_URL,"GET",null)
    .then(data =>{
        let blogArr = objToArr(data);
        createBlogs(blogArr);
    })
}

fetchAllData()






function onBlogSubmit(eve) {

    eve.preventDefault();

    let blogObj = {
        title : titleControl.value,
        content : contentControl.value,
        userId : userIdControl.value
    }
    
    eve.target.reset()

    makeApiCall(BLOG_URL,"POST",blogObj)
    .then((res) =>{

        let card = document.createElement('div');
        card.className = "card mb-3 shadow-lg bg-white rounded"
        card.id = res.name;
        card.innerHTML = `<div class="card-header">
                        <h3 class="mb-0">${blogObj.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">${blogObj.content}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline btn-info"onClick = "onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-outline btn-warning"onClick = "onRemove(this)">Remove</button>
                    </div>
                 </div>`

        blogContainer.append(card)
        snackBar(`New blog created successfully!!!!`,'success')
    } )
    .catch(err =>{
        snackBar(err,"error")
    })
}


function onRemove(ele) {
Swal.fire({
  title: "Do you want to remove the blog?",

  showCancelButton: true,
  confirmButtonText: "Remove",
 
}).then((result) => {
  if (result.isConfirmed) {
let REMOVE_ID = ele.closest('.card').id;

let REMOVE_URL = `${BASE_URL}/blogs/${REMOVE_ID}.json`

makeApiCall(REMOVE_URL,"DELETE",null)
.then((res)=>{

    ele.closest('.card').remove()

    snackBar(`The Blog is removed successfully!!!`,"success")
})
 .catch(err =>{
    snackBar(err,"error")
    
})
}
});

}

function onEdit(ele) {
    let EDIT_ID = ele.closest('.card').id;
    
    localStorage.setItem("EDIT_ID",EDIT_ID)

    let EDIT_URL = `${BASE_URL}/blogs/${EDIT_ID}.json`

    makeApiCall(EDIT_URL,"GET",null)
    .then((res)=>{
        titleControl.value = res.title;
        contentControl.value = res.content;
        userIdControl.value = res.userId;


        addPostBtn.classList.add('d-none')
        updatePostBtn.classList.remove('d-none')

    })
    .catch(err =>{
        snackBar(err,"error")
    })

}

function onBlogUpdate() {

    UPDATED_ID = localStorage.getItem("EDIT_ID")

    let UPDATED_OBJ = {
        title : titleControl.value,
        content : contentControl.value,
        userId : userIdControl.value,
        id: UPDATED_ID
    }

    UPDATE_URL = `${BASE_URL}/blogs/${UPDATED_ID}.json`

    makeApiCall(UPDATE_URL,"PATCH",UPDATED_OBJ)
    .then((res)=>{
        let card = document.getElementById(UPDATED_ID)
        card.querySelector('.card h3').innerHTML= UPDATED_OBJ.title;
        card.querySelector('.card p').innerHTML =UPDATED_OBJ.content;


        addPostBtn.classList.remove('d-none')
        updatePostBtn.classList.add('d-none')
        blogForm.reset()

        snackBar(`Blog Is UPDATED Successfullly!!!!` ,"success")
    })
    .catch(err =>{
        snackBar(err,"error")
    })
}


blogForm.addEventListener("submit", onBlogSubmit)
updatePostBtn.addEventListener("click", onBlogUpdate)