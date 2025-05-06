'use client'

import { useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation";

import styles from "../app/styles/createpost.module.css"
import fetcher from "@/utils/fetcher";;
import { formatDate, toBase64 } from "@/utils/convert";
import ErrorPage from "./ErrorPage";

export default function PostForm(){
    const [dataUser, setDataUser] = useState(null); 
    const [error, setError] = useState(null)
    const router = useRouter();
        const [themeColor, setThemeColor] = useState(null);
      useEffect(() => {
        const theme = localStorage.getItem("theme");
        setThemeColor(theme);
      }, []); 
    
    const  getUserFollower = async() => {
        const response = await fetch("http://localhost:8080/api/createpost", {
            method: 'GET',
            credentials: 'include',
        })
        if (response.status == 401){
            router.push("/login")
            return
        }else if (response.status == 400){
           setError(response.statusText)
           return
        }else if (response.status == 500){
            setError(response.statusText)
            return
        }
        let data = await response.json()
        setDataUser(data)
        // console.log(data);
    }

    const fileInputRef = useRef(null);
    const handleIconClick = () => {
        fileInputRef.current.click();
    };

    const handleTextarea = () =>{
        const textarea = document.querySelector('textarea');
        textarea.addEventListener('input', () => {
            const maxLength = 2000;
            if (textarea.value.length > maxLength) {
                textarea.value = textarea.value.slice(0, maxLength); 
            }
            
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        });
    }
  
    const handleRemoveImage = () => { 
        setFormData(prev => ({
            ...prev,
            image: null 
        }));
    };

    const [formData, setFormData] = useState({
        postText: "",
        image: null,
        postVisibility: "",
        userSelected: [],
    })

    const handleDataChange = (event) => {
        const { type, name, value } = event.target;
    
        if (type === "checkbox") {
            const isChecked = event.target.checked;
            const personId = parseInt(value); 
    
            if (isChecked) {
                setFormData(prev => ({
                    ...prev,
                    userSelected: [...prev.userSelected, personId]
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    userSelected: prev.userSelected.filter(id => id !== personId)
                }));
            }
        }
        else if (type === "file") {
            const file = event.target.files[0];
            setFormData(prev => ({
                ...prev,
                image: file 
            }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (event) =>{
        event.preventDefault()
        let imageName
        if (formData.image){
            imageName = formData.image.name
            const ext = imageName.split(".")[1].toLowerCase()
            if (ext != "png" && ext != "jpg" && ext != "jpeg" && ext != "gif"){
                alert("The extension of your picture don't take account")
                return
            }
            formData.image = await toBase64(formData.image)
        }
        formData.imageName = imageName
        fetcher.post("/createpost", formData).then(response =>{
            if(response.status == 200){
                console.log("data sended")
                router.push("/")

            }else if (response.status == 400){
                console.log("bad post", response);
                setError(error)
            }else if (response.status == 500){
                setError(error)
            }
        })
    }


    useEffect(() =>{
        getUserFollower()
    }, [])

    if (error){
        return <ErrorPage message={error} />
    }

    return (
        <>
            <div className={styles.globForm}>
                <div className={styles.headForm}> 
                    <p>New Post</p>
                </div>
                <div className={styles.divForm}>
                    {dataUser && (
                        <div className={styles.postForm}>
                            <div className={styles.headPost}> 
                                {dataUser.UserInfo.Avatar ? (
                                    <img src={"../images/users/"+dataUser.UserInfo.Avatar} className={styles.userPhoto}/>
                                ): 
                                    <img src={"../images/users/default.png"} className={styles.userPhoto}/>
                                }
                                <span className={styles.userName}>{dataUser.UserInfo.firstName}</span>
                            </div>
                            
                            <form onSubmit={handleSubmit} method="post" encType="multipart/form-data" id={styles.formPost}>
                                <textarea  id="post-content" onInput={handleTextarea} name="postText" rows="1" className={styles.textarea} placeholder="Enter your text here..." value={formData.postText || ""} onChange={handleDataChange} ></textarea>
                                <input type="file" name="image" accept="image/*" className={styles.imageInput} ref={fileInputRef} onChange={handleDataChange}/>
                                {formData.image && (
                                    <div className={styles.imageContainer}>
                                        <img src={URL.createObjectURL(formData.image)} alt="selected" className={styles.selectedImage} />
                                        <span className={styles.removeIcon} onClick={handleRemoveImage}>&times;</span>
                                    </div>
                                )}
                                <img src="../photo.png" className={styles.galerie} onClick={handleIconClick} />
                                <div className={styles.postVisibility}>
                                    <div className={styles.select}>
                                        <select name="postVisibility" onChange={handleDataChange} id={styles.selectOption}>
                                            <option value={"public"}>🌍 Public</option>
                                            <option value={"follower"}>👥 Followers</option>
                                            <option value={"choice"}>✅ Choose</option>
                                        </select>
                                        {formData.postVisibility === 'choice' && (
                                            <div className={styles.divChoice}>
                                                <ul className={styles.ulChoice}>
                                                {dataUser.Follower ? (dataUser.Follower.map(follower => (
                                                    <li key={follower.Use.Id}>
                                                        <label htmlFor={`person_${follower.Use.Id}`}>
                                                            {follower.Use.Avatar ? <img src={"../images/users/"+follower.Use.Avatar} className={styles.userChoice} />
                                                            :
                                                             <img src={"../images/users/default.png"} className={styles.userChoice} />
                                                            }
                                                            <span>{follower.Use.FirstName}</span>
                                                        </label>
                                                        <input type="checkbox" name="userSelected" value={follower.Use.Id} onChange={handleDataChange} id={`person_${follower.Use.Id}`} className={styles.checkbox}/>
                                                    </li>
                                                ))): <span style={{color: "red"}}>You have not a follower</span>}
                                                </ul>
                                            </div>
                                        )}
                                        {(formData.postVisibility === 'choice' && (!dataUser.Follower || formData.userSelected.length == 0) || (formData.postText.trim().length == 0 && !formData.image)) ? (
                                            null
                                        ): 
                                            <button id={styles.publier} type="submit" onClick={handleSubmit}>Publish</button>
                                        }
                                    </div>
                                </div>    
                            </form>
                        </div>
                    )}
                </div>
            </div>
            {themeColor == "light" && (
        <style jsx global>{`
          body {
            background: #fff;
          }
          p {
            color: #000;
          }
          h4 , h1 , h2 , h3 , h5 , h6{
            color: #000 !important;
          }
          label {
            color: #000 !important;
          }
          input {
            color: #000;
             background: transparent !important;
          }
          textarea {
            color: #000;
          }
          button {
            color: #000;
          }
          div {
            color: #000 !important;
            background: #fff !important;
          }
            input:focus {
              background: transparent !important;
            }
            .createpost_galerie__rQOpY {
            filter: invert(1);
            }
        `}</style>
      )}
        </>
    )
}