import {useState, useEffect, useRef, useContext} from 'react'
import ContextProvider from '../../Resources/ContextProvider';

const Profile = ()=>{
    const {storePath} = useContext(ContextProvider)
    useEffect(()=>{
        storePath('user-profile')
    },[storePath])
    return (
        <>
        USER PROFILE
        </>
    )
}

export default Profile

