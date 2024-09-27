import {useState, useEffect, useRef, useContext} from 'react'
import ContextProvider from '../../Resources/ContextProvider';

const Panel = ()=>{
    const {storePath} = useContext(ContextProvider)
    useEffect(()=>{
        storePath('admin')
    },[storePath])
    return (
        <>
        ADMIN PANEL
        </>
    )
}

export default Panel

