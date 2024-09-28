import './Categories.css'
import { useState, useEffect, useRef, useContext } from "react";
import ContextProvider from '../../../Resources/ContextProvider';

const Categories = ()=>{
    const {
        server, fetchServer,auctionItems,
        categories, setCategories, getCategories
    } = useContext(ContextProvider)
    return(
        <>
            CATEGORIES
        </>
    )
}

export default Categories