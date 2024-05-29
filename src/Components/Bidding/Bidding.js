import './Bidding.css'
import ContextProvider from '../../Resources/ContextProvider'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
import {motion, AnimatePresence} from 'framer-motion'
import { FaCircleCheck } from 'react-icons/fa6';
import { IoChevronBack, IoChevronForwardOutline } from "react-icons/io5";
const Bidding = ()=>{
    const {storePath, userRecord, currBid, fetchServer,
        setCurrBid, setLoginMessage, 
        auctionImages,server, loadAuctions
    } = useContext(ContextProvider)
    const [bidSuccessful, setBidSuccessful] = useState(false)
    const [bidMessage, setBidMessage] = useState('MAKE BID')
    const [curBid, setCurBid] = useState(JSON.parse(window.localStorage.getItem('curbid')))
    const [viewBidEntry, setViewBidEntry] = useState(false)
    const [bidvalue, setBidvalue] = useState('')
    const [bidStatus, setBidStatus] = useState('')
    const Navigate = useNavigate()
    useEffect(()=>{
        // console.log(currBid)
        // setCurrBid(JSON.parse(window.localStorage.getItem('currbid')))        
        setCurBid(JSON.parse(window.localStorage.getItem('curbid')))
    },[currBid,window.localStorage.getItem('curbid')])
    useEffect(()=>{
        storePath('bidding')
    },[])
    const  makeBid = async ()=>{
        if(userRecord===null){
            Navigate('/login')
            setLoginMessage("Kindly Login to Make Your Bid")
        }else{
            if (targetTimer<=bidPeriod && targetTimer >=0){   
                var price = ''
                price = Number(curBid.initialprice.split('').filter((chr)=>{
                    return chr!==','
                }).join(''))

                var bidprice = ''
                bidprice = Number(curBid.bidprice.split('').filter((chr)=>{
                    return chr!==','
                }).join(''))
                
                if(Number(bidvalue)>price && Number(bidvalue)>bidprice){  
                    setBidMessage('BIDDING')                                 
                    loadAuctions()
                    setTimeout(async()=>{                        
                        const auctionbiders = !curBid.biders.includes(userRecord._id)?curBid.biders.concat(userRecord._id):currBid.biders
                        const updateField = {
                            bidprice: bidvalue,
                            bids: Number(curBid.bids)+1,
                            biders: auctionbiders,
                            bidersno: auctionbiders.length
                        }                        
                        const resps = await fetchServer("POST", {
                            database: "AuctionItems",
                            collection: curBid.type, 
                            record: curBid,
                            update: updateField
                        }, "updateAuctionItems", server)
                          
                        if (resps.err){
                            console.log(resps.mess)
                            setBidMessage('MAKE BID')
                        }else{
                            if (resps.updated){
                                loadAuctions()
                                setTimeout(()=>{
                                    setBidSuccessful(true)                               
                                    setBidStatus("Your bid was Successful") 
                                    setBidMessage('MAKE BID')
                                    setBidvalue('')
                                },3000)
                                
                                setTimeout(()=>{
                                    setBidStatus("")
                                    setViewBidEntry(false)
                                },5000)
                            }
                        }                    
                       
                    },3000)
                }else{
                    setBidStatus("Your next bid must be greater than ₦"+(curBid.bidprice?Number(curBid.bidprice).toLocaleString():curBid.initialprice))
                    setTimeout(()=>{
                        setBidStatus("")
                    },5000) 
                }                
            }else{
                setBidStatus("Bidding is not available for this item at this time")
                setTimeout(()=>{
                    setBidStatus("")
                },5000)
            }
        }
    }
    const calculateTimeLeft = (target) => {
        const now = new Date().getTime();
        const targetDate = new Date(target).getTime();
        const distance = targetDate - now;
    
        return distance
    };
    
    const getTimerString = (time)=>{
        if (time <= 0) return 'EXPIRED';
        const days = Math.floor(time / (1000 * 60 * 60 * 24));
        const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((time % (1000 * 60)) / 1000);
    
        return `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
    }
    const [startTimer, setStartTimer] = useState(![null, undefined].includes(curBid)?calculateTimeLeft(curBid.start):'');
    const [targetTimer, setTargetTimer] = useState(![null, undefined].includes(curBid)?calculateTimeLeft(curBid.target):'');
    
    useEffect(() => {
        if(![null, undefined].includes(curBid)){           
            const startTimerInterval = setInterval(() => {
                setStartTimer(calculateTimeLeft(curBid.start));
            }, 1000);
        
            return () => clearInterval(startTimerInterval);
        }
    }, [curBid]);
    
    useEffect(()=>{
        if(![null, undefined].includes(curBid)){
            const targetTimerInterval = setInterval(() => {
                setTargetTimer(calculateTimeLeft(curBid.target));
            }, 1000);
        
            return () => clearInterval(targetTimerInterval);
        }
    
    },[currBid])
    let starting = ''
    let ending = ''
    let bidPeriod = ''
    if(![null, undefined].includes(curBid)){
        starting = getTimerString(startTimer)
        ending = getTimerString(targetTimer)
        bidPeriod = (curBid.target-curBid.start)
    }
    return(
        <>
            <header className='hheader bidheader'>
                {curBid!==null && auctionImages!==null && <div className='biddingcover'>
                    <div className='bidpre'><IoChevronBack/></div>
                    <div className='bidnext'><IoChevronForwardOutline/></div>
                    <div className='biddetails'>
                        {/* <div className='bidbase'>
                            <div className='bidbrand'>{currBid.brand}</div>
                        </div> */}
                        <img src={auctionImages[curBid.src]} className='bidimg'/>
                        {/* <div className='bidlive'>LIVE</div> */}
                        <div className={'bidlive '+(targetTimer<=0?' bidended':'')}>
                            {startTimer>0 && 'LIVE SOON'}
                            {targetTimer<=bidPeriod && targetTimer >=0 && 'LIVE'}
                            {targetTimer<=0 && 'LIVE ENDED'}
                        </div>
                        <div className='bidname'>{curBid.name}</div>
                        <div className='biddesc'>{curBid.description}</div>
                        <div className='auctionlive'>
                            <div className='auctionbids'>
                                <div className='bid-no'>{curBid.bids}</div>
                                <div>All Bids</div>
                            </div>
                            <div className='auctionbiders'>
                                <div className='bid-no'> {curBid.biders.length}</div>
                                <div>Bidders</div>
                            </div>

                            {userRecord!==null && <div className='myauctionbids'>
                                <div className='bid-no'>{curBid.mybids}</div>
                                <div>Your Bids</div>
                            </div>}
                        </div>
                        {startTimer>0 && <div className='auctiontimer bidauctiontimer'>
                            <div>Live in</div>
                            <div className='timervalue'>{starting}</div>
                        </div>}

                        {targetTimer<=bidPeriod && targetTimer>=0 && <div className='auctiontimer bidauctiontimer'>     
                            <div>Ends in</div>
                            <div className='timervalue'>{ending}</div>
                        </div>}
                        <div className='mobilebidlive' onClick={()=>{
                            setViewBidEntry(true)
                            setBidSuccessful(false)
                        }}>Make Your Bid</div>

                    </div>
                    {<div className={'bidentry'+(viewBidEntry?'':' viewbidentry')}>
                        <IoMdArrowRoundBack className='leavebidentry' onClick={()=>{
                            setViewBidEntry(false)
                        }}/>
                        <div className='bidentrytitle'>
                            <div className='entrytitle'>{'₦'+(curBid.bidprice?Number(curBid.bidprice).toLocaleString():curBid.initialprice)}</div>
                            <div className='entrycardlabel'>HIGHEST BID SO FAR</div>
                        </div>
                        <AnimatePresence>
                            {bidStatus && <motion.div initial={{opacity:0}}
                                animate={{opacity:1}}
                                transition={{
                                    opacity: {
                                        duration: .8,
                                        ease: 'easeIn'
                                    },
                                }}
                                exit={{opacity: 0, transition:{opacity:{
                                    duration: 0.8,
                                    ease: 'easeOut',
                                }}}}
                                
                                className='verifymsg bidverifymsg'>
                                {bidSuccessful && <FaCircleCheck className='verifycheck'/>}
                                <div>{bidStatus}</div>
                            </motion.div>}
                        </AnimatePresence>
                        <div className='userbidcard'>
                            <label>WHAT'S YOUR BID?</label>
                            <input 
                                className='lgninp bidinp'
                                type='number'
                                value={bidvalue}
                                onChange={(e)=>{
                                    setBidvalue(e.target.value)
                                }}
                                placeholder={'> ₦'+(curBid.bidprice?Number(curBid.bidprice).toLocaleString():curBid.initialprice)}
                            />
                            <div className='userbidbtn' onClick={makeBid}>{targetTimer<=bidPeriod && targetTimer >=0 ? bidMessage :'NOT AVAILABLE'}</div>
                        </div>
                    </div>}
                </div>}
            </header>
            <main className='main bidmain'></main>
            <footer className='footer'></footer>
        </>
    )
}

export default Bidding