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
import JelweryData from './Resources/AuctionData/JewelryData'
import RelicData from './Resources/AuctionData/RelicData'
import ArtsData from './Resources/AuctionData/ArtsData'
import TvData from './Resources/AuctionData/TvData'
import CoushionData from './Resources/AuctionData/CoushionData'
import ShoeData from './Resources/AuctionData/ShoeData'
import WatchData from './Resources/AuctionData/WatchData'
import DrinkData from './Resources/AuctionData/DrinkData';
import TomatoData from './Resources/AuctionData/TomatoData';

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
  const [currBid, setCurrBid] = useState(JSON.parse(window.localStorage.getItem('curbid')))
  const [path, setPath] = useState('')
  const [verificationMail, setVerificationMail] = useState(null)
  const [categories, setCategories] = useState(null)
  const [auctionItems, setAuctionItems] = useState([])
  const [catTries, setCatTries] = useState(0)
  const [myBidcount, setMybidcount] = useState(null)
  const auctionImages = {...DrinkData,...TomatoData,...TvData,...WatchData,...CoushionData,...ArtsData,...JelweryData,...RelicData,...ShoeData}
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
  
  // const targetDate = new Date("May 30, 2024 12:00:00").getTime();
// Update countdown every second
const countDownTime = (startDate,targetDate,timerId) =>{
  
  // const startDate = new Date().getTime();
  const distance = targetDate - startDate;

  // Calculate days, hours, minutes, and seconds
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="countdown"
  if (distance < 0) {
      clearInterval(timerId);
      return null;
  }
  return  `
      ${days}d ${hours}h ${minutes}m ${seconds}s
  `;
}
  const storePath = (path)=>{
    setPath(path)
    window.localStorage.setItem('curr-path',path)
    // if (window.localStorage.getItem('sess-id') !== null){
    //   window.localStorage.setItem('curr-path',path)
    // } else {
    //   removeSessions()
    // }
  }
  // useEffect(()=>{
  //   const auctionReloadInterval = setInterval(()=>{
  //     if (userRecord!==null){
  //       loadAuctions(true)
  //     }else{
  //       loadAuctions()
  //     }
  //   },10000)
  //   return () => clearInterval(auctionReloadInterval);
  // },[])
  const removeSessions = (path)=>{
    window.localStorage.removeItem('sess-recg-id')
    window.localStorage.removeItem('idt-curr-usr')
    window.localStorage.removeItem('sessn-id')
    window.localStorage.removeItem('curr-path')
    // window.localStorage.removeItem('curbid')
    window.localStorage.removeItem('slvw')
    window.localStorage.removeItem('sldtl')
    setSessID(null)
    if (path !== undefined){
      Navigate("/"+path)
    }else{
      Navigate("/")
    }
  }
  const loadAuctions = async({user, reload})=>{
      const categories = await getCategories()
      // if (categories!==null){
      //   let categoryList = []
      //   categories.forEach((type)=>{
      //     categoryList = categoryList.concat([type.category])
      //   })
      //   console.log(categoryList)
      //   loadAuctionItems(categoryList,{})
      // }
      if(user!==null){
        countBids(user)
      }
      const categoryList = ['drinks','tomatoes','tvs', 'watches', 'relics', 'jewelry', 'coushions', 'arts', 'shoes']
      if(reload===true){
        loadAuctionItems(categoryList,{},user,true)
      }else{
        loadAuctionItems(categoryList,{},user)        
      }
  }
  const countBids = async (user)=>{
    const resp1 = await fetchServer("POST", {
      database: "Bidder_"+user.username,
      collection: "Auctions", 
      prop: {}
    }, "getDocCount", SERVER)

    if (resp1.err){
      console.log(resp1.err)
    }else{
      // console.log('bid count:',resp1.count)
      setMybidcount(resp1.count)
    }
  }
  const loadPage = async (propVal, currPath)=>{
    loadAuctions({user:null, reload: false})
    const resp = await fetchServer("POST", {
      database: "AuctionDB",
      collection: "UsersBase", 
      sessionId: propVal
    }, "getDocDetails", SERVER)
    if ([null, undefined].includes(resp.record)){
      removeSessions()
    }else{
      setUserRecord(resp.record)
      // console.log(resp.record)
      loadAuctions({user:resp.record, reload: false})
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
  
  const loadAuctionItems = async (categories,filter,user,reload)=>{
    let loadgap = 0
    const currBidDetails = JSON.parse(window.localStorage.getItem('currbid'))
    categories.forEach( async (category)=>{
      setTimeout( async ()=>{
        const resp = await fetchServer("POST", {
          database: 'AuctionItems',
          collection: category, 
          prop: filter
        }, "getDocsDetails", SERVER)
        if ([null,undefined].includes(resp.record)){
            // console.log(resp)
        }else{
            if (resp.err){
                console.log(resp.mess)
            }else{
              // console.log("got details",resp.record)
                // console.log(reload, auctionItems)
                if (reload===true && auctionItems.length){
                  setAuctionItems((auctionItems)=>{
                    resp.record.forEach((record)=>{
                      auctionItems.forEach((auction,index)=>{
                        if ([null, undefined].includes(auction.mybids)){
                          auction.mybids = 0
                        }
                        if(user!==null){
                          if (auction._id === record._id){
                            auctionItems[index]=record
                            auction.biders.forEach((bidder)=>{
                              if(bidder.bidder === user._id){
                                auctionItems[index].mybids = bidder.mybids.length
                              }
                            })
                          }else{
                            auction.biders.forEach((bidder)=>{
                              if(bidder._id === user._id){
                                auction.mybids = bidder.mybids.length
                              }
                            })
                          }
                        }
                        
                      })
                    })
                    return [...auctionItems]
                  })
                }else{
                  // console.log('setting auction items')
                  setAuctionItems((auctionItems)=>{
                    auctionItems.forEach((auction)=>{
                      let bidders = auction.biders
                      if ([null, undefined].includes(auction.mybids)){
                        auction.mybids = 0
                      }
                      if (user!==null){
                        bidders.forEach((bidder)=>{
                          // console.log(bidder, user)
                          if(bidder.bidder === user._id){
                            auction.mybids = bidder.mybids.length
                          }
                        })
                      }
                    })
                    return [...auctionItems, ...resp.record]
                  })
                 
                }
                // console.log(currBidDetails)
                if(currBidDetails!==null){
                  // console.log("not null")
                  resp.record.forEach((record)=>{
                    if (record._id === currBidDetails._id){
                      // console.log(true)
                      setCurrBid(record)
                      // setCurrBid(JSON.parse(window.localStorage.getItem('currbid')))
                      window.localStorage.setItem('curbid',JSON.stringify(record))
                    }
                  })
                }
              }
        }
      },loadgap*1000)
      loadgap += 1
      // if (reload === true){
      //   loadgap += 0
      // }else{
      // }
    })
  }
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
      var sid = window.localStorage.getItem('sessn-id')
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
        removeSessions(currPath)
        loadAuctions({user:null,reload:true})
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
      auctionImages,
      countDownTime,
      loadAuctions,
      myBidcount
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
