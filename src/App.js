import { useEffect, useState } from 'react';
import './App.css';
import { Routes, Route, useNavigate } from "react-router-dom";
import ContextProvider from './Resources/ContextProvider';
import Login from './Components/Login/Login';
import Signin from './Components/Signin/Signin'
import LandingPage from './LandingPage/LandingPage'
import { AnimatePresence, motion } from 'framer-motion';
import fetchServer from './Resources/ClientServerAPIConn/fetchServer'
import Navbar from './LandingPage/Navigator/Navbar';
import Bidding from './Components/Bidding/Bidding';
import Verify from './Components/Verify/Verify';

function App() {
  // const SERVER = "http://localhost:3001"
  const SERVER = "https://bid2buyserver.vercel.app"
  const [intervalId, setIntervalId] = useState(null)
  const [sessId, setSessID] = useState(null)
  const [winSize, setWinSize] = useState(window.innerWidth)
  const [userRecord, setUserRecord] = useState(null)
  const [openNavbar, setOpenNavbar] = useState(false)
  const pathList = ['', 'bidding','login', 'signup', 'verify']
  const noNavPath = ['login', 'signup', 'verify']
  const [loginMessage, setLoginMessage] = useState('')
  const [currBid, setCurrBid] = useState(null)
  const [path, setPath] = useState('')
  const [verificationMail, setVerificationMail] = useState(null)
  const [categories, setCategories] = useState(null)
  const [auctionItems, setAuctionItems] = useState([])
  const [auctionImages, setAuctionImages] = useState(null)
  const [catTries, setCatTries] = useState(0)
  const shuffleList = (array) => {
    var currentIndex = array.length,
      randomIndex,
      temporaryValue
    while (0 !== currentIndex) {
      var randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1
      temporaryValue = array[currentIndex]
      array[currentIndex] = array[randomIndex]
      array[randomIndex] = temporaryValue
    }
    return array
  }
  const generateCode = () => {
    let number = '0123456789987654321001234567899876543210'
    var list = number.split('')
    var shuffledList = shuffleList(list)
    const code = shuffledList.slice(6, 12).join('')
    return code
  }
  const [verificationCode, setVerificationCode] = useState(generateCode())
  
  const Navigate = useNavigate()
  
  const storePath = (path)=>{
    setPath(path)
    window.localStorage.setItem('curr-path',path)
    // if (window.localStorage.getItem('sess-id') !== null){
    //   window.localStorage.setItem('curr-path',path)
    // } else {
    //   removeSessions()
    // }
  }

  const removeSessions = (path)=>{
    window.localStorage.removeItem('sess-recg-id')
    window.localStorage.removeItem('idt-curr-usr')
    window.localStorage.removeItem('sess-id')
    window.localStorage.removeItem('curr-path')
    window.localStorage.removeItem('slvw')
    window.localStorage.removeItem('sldtl')
    setSessID(null)
    if (path !== undefined){
      Navigate("/"+path)
    }else{
      Navigate("/")
    }
  }
  const loadAuctions = async()=>{
      const categories = await getCategories()
        if (categories!==null){
          let categoryList = []
          categories.forEach((type)=>{
            categoryList = categoryList.concat([type.category])
          })
          // console.log(categoryList)
          loadAuctionItems(categoryList,{})
      }
      // const categoryList = ['tvs', 'watches', 'relics', 'jewelry', 'coushions', 'arts', 'shoes']
      // loadAuctionItems(categoryList,{})
  }
  const loadPage = async (propVal, currPath)=>{
    const resp = await fetchServer("POST", {
      database: "AuctionDB",
      collection: "UsersBase", 
      sessionId: propVal
    }, "getDocDetails", SERVER)
    if (resp.record === null){
      removeSessions()
    }else{
      setUserRecord(resp.record)
      loadAuctions()
      setVerificationMail(resp.record.email)
      if(!resp.record.verified){
        Navigate('/verify')
      }else{
        Navigate('/'+currPath)
      }
    }
  }

  const getCategories = async () =>{
    setCatTries((tries)=>{
      return(tries+1)
    })
    const resp = await fetchServer("POST", {
        database: 'AuctionSettings',
        collection: "Categories", 
        prop: {}
    }, "getDocsDetails", SERVER)
    if (resp.record === null){
        console.log(resp)
        return null
    }else{
        if (resp.err){
            console.log(resp.mess)
            if(catTries<4){
              setTimeout(()=>{
                getCategories()
              },5000)
            }
        }else{
            setCategories(resp.record)
        }
        return resp.record
    }
  }
  
  const loadAuctionItems = async (categories,filter)=>{
    let loadgap = 0
    categories.forEach( async (category)=>{
      setTimeout( async ()=>{
        const resp = await fetchServer("POST", {
          database: 'AuctionItems',
          collection: category, 
          prop: filter
        }, "getDocsDetails", SERVER)
        if (resp.record === null){
            console.log(resp)
        }else{
            if (resp.err){
                console.log(resp.mess)
            }else{
                setAuctionItems((auctionItems)=>{
                  return [...auctionItems, ...resp.record]
                })
            }
        }
      },loadgap*1000)
      loadgap += 3
  })}
  const getDate = (timestamp)=>{
    const date = new Date(timestamp)
    var month = (date.getMonth() + 1);               
    var day = date.getDate();
    if (month < 10) 
        month = "0" + month;
    if (day < 10) 
        day = "0" + day;
    var today = day + '-' + month + '-' + date.getFullYear();
    return today;
  }

  const getImage = async (body)=>{
    const resp = await fetchServer("POST", 
      body, 
      "getImgUrl", 
      SERVER
    )
    if (resp.err){
      console.log(resp.mess)
      return ''
    }else{
      return resp.url
    }
  }

  const getWinSize = ()=>{
    setWinSize(window.innerHeight)
  }

  useEffect(()=>{
    window.addEventListener("resize", getWinSize)
    
    return ()=>{
      window.removeEventListener("resize", getWinSize)
    }
  },[winSize])
  
  useEffect(()=>{
    var currPath = window.localStorage.getItem('curr-path')
    if (currPath !== null && pathList.includes(currPath)){
      var sid = window.localStorage.getItem('sess-id')
      var sess = 0
      if (sid !==null ){
        sid.split('').forEach((chr)=>{
          sess += chr.codePointAt(0)
        })
        const sesn = window.localStorage.getItem('sess-recg-id')
        const session = window.localStorage.getItem('idt-curr-usr')
        if (sesn !== null && session != null){
          if (sesn / session === sess){
            loadPage(sid, currPath)
          } else {
            removeSessions()
          }
        }else{
          removeSessions()
        }
      }else{
        loadAuctions()
        removeSessions()
      }
    }else{
      loadAuctions()
      // removeSessions()
    }
  },[sessId])

  return (
    <>
    <ContextProvider.Provider value={{
      openNavbar, setOpenNavbar,
      server:SERVER, 
      removeSessions,
      fetchServer,
      loadPage,
      sessId,
      userRecord, setUserRecord,
      storePath,
      getImage,
      getDate,
      loginMessage, setLoginMessage,
      currBid, setCurrBid,
      verificationMail, setVerificationMail,
      verificationCode, setVerificationCode,
      generateCode,
      categories, setCategories,
      auctionItems, setAuctionItems,
      auctionImages, setAuctionImages
    }}>
       {!noNavPath.includes(path) && <Navbar/>}
       <Routes>
              <Route element={<LandingPage/>} path="/"></Route>
              <Route element={<Login/>} path='/login'></Route>
              <Route element={<Signin/>} path='/signup'></Route>
              <Route element={<Verify/>} path='/verify'></Route>
              <Route element={<Bidding/>} path='/bidding'></Route>
        </Routes>
    </ContextProvider.Provider>
    </>
  );
}

export default App;
