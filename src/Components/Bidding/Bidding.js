import './Bidding.css'
import ContextProvider from '../../Resources/ContextProvider'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
import {motion, AnimatePresence} from 'framer-motion'
import { FaCircleCheck } from 'react-icons/fa6';
import { IoChevronBack, IoChevronForwardOutline } from "react-icons/io5";
import { Carousel } from 'react-responsive-carousel';
const Bidding = ()=>{
    const {storePath, userRecord, currBid, fetchServer,
        setCurrBid, setLoginMessage, 
        auctionImages,server, loadAuctions, auctionItems
    } = useContext(ContextProvider)
    const [bidSuccessful, setBidSuccessful] = useState(false)
    const [bidMessage, setBidMessage] = useState('MAKE BID')
    const [curBid, setCurBid] = useState(JSON.parse(window.localStorage.getItem('curbid')))
    const [viewBidEntry, setViewBidEntry] = useState(false)
    const [bidvalue, setBidvalue] = useState('')
    const [bidStatus, setBidStatus] = useState('')
    const [biditemindex, setBiditemindex] = useState(0)    
    const Navigate = useNavigate()
    useEffect(()=>{
        // console.log(currBid)
        // setCurrBid(JSON.parse(window.localStorage.getItem('currbid')))  
        setBiditemindex(0)
        const bid = JSON.parse(window.localStorage.getItem('curbid'))
        // console.log(bid)
        if(![null,undefined].includes(bid)){
            let ct = 0
            auctionItems.filter((auction)=>{
                let datenow = Date.now()
                return auction.start <= datenow && auction.target >= datenow
            }).forEach((auction, index)=>{
                if (auction._id === bid._id){
                    ct += 1 
                    if (ct===1){
                        setBiditemindex(index)
                        // console.log('true value')
                        // console.log(index, auction._id, bid._id)
                        // console.log(index)
                    }   
                }     
            })  
        }    
        setCurBid(bid)
    },[currBid,window.localStorage.getItem('curbid')])
    useEffect(()=>{
        storePath('bidding')
    },[])
    const  makeBid = async ()=>{
        if(userRecord===null){
            Navigate('/login')
            setLoginMessage("Kindly Login to Make Your Bid")
        }else{
            const bidPeriod = targetTimers[biditemindex] - startTimers[biditemindex]

             if (targetTimers[biditemindex]<=bidPeriod && targetTimers[biditemindex] >=0){   
                var price = ''
                price = Number(curBid.initialprice.split('').filter((chr)=>{
                    return chr!==','
                }).join(''))

                var bidprice = ''
                bidprice = Number(curBid.bidprice.split('').filter((chr)=>{
                    return chr!==','
                }).join(''))
                // console.log(bidvalue,bidprice,price)
                if(Number(bidvalue)>price && Number(bidvalue)>bidprice){  
                    setBidMessage('BIDDING')                                 
                    loadAuctions(true)
                    setTimeout(async()=>{                        
                        const auctionbiders = !curBid.biders.includes(userRecord._id)?curBid.biders.concat(userRecord._id):curBid.biders
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
                                loadAuctions(true)
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
    const [startTimers, setStartTimers] = useState(![null, undefined].includes(curBid)?
        auctionItems.filter((auction)=>{
            let datenow = Date.now()
            return auction.start <= datenow && auction.target >= datenow
        }).map((auction) =>calculateTimeLeft(auction.start)):'');
    const [targetTimers, setTargetTimers] = useState(![null, undefined].includes(curBid)?
        auctionItems.filter((auction)=>{
            let datenow = Date.now()
            return auction.start <= datenow && auction.target >= datenow
        }).map((auction) =>calculateTimeLeft(auction.target)):'');
    
    useEffect(() => {
        if(![null, undefined].includes(curBid)){           
            const startTimerInterval = setInterval(() => {
                setStartTimers(auctionItems.filter((auction)=>{
                    let datenow = Date.now()
                    return auction.start <= datenow && auction.target >= datenow
                }).filter((auction)=>{
                    let datenow = Date.now()
                    return auction.start <= datenow && auction.target >= datenow
                }).map((auction) =>calculateTimeLeft(auction.start)));
            }, 1000);
        
            return () => clearInterval(startTimerInterval);
        }
    }, [auctionItems]);
    
    useEffect(()=>{
        if(![null, undefined].includes(curBid)){
            const targetTimerInterval = setInterval(() => {
                setTargetTimers(auctionItems.filter((auction)=>{
                    let datenow = Date.now()
                    return auction.start <= datenow && auction.target >= datenow
                }).map((auction) =>calculateTimeLeft(auction.target)));
            }, 1000);
        
            return () => clearInterval(targetTimerInterval);
        }
    
    },[auctionItems])
    
    
    return(
        <>
            <header className='hheader bidheader'>
            <Carousel 
                autoPlay= {!viewBidEntry} 
                stopOnHover 
                interval={5000} 
                showArrows={!viewBidEntry}
                useKeyboardArrows={!viewBidEntry}
                transitionTime={1000} 
                selectedItem={biditemindex} 
                swipeable={!viewBidEntry}
                showThumbs={false}
            >
                {auctionItems.length ? auctionItems.filter((auction)=>{
                    let datenow = Date.now()
                    return auction.start <= datenow && auction.target >= datenow
                }).map((auction, index) => {
                    const starting = getTimerString(startTimers[index])
                    const ending = getTimerString(targetTimers[index])
                    const bidPeriod = targetTimers[index] - startTimers[index]
                    return (
                        curBid!==null && auctionImages!==null && <div className='biddingcover' key={auction._id}>
                            {/* <div className='bidpre'><IoChevronBack/></div>
                            <div className='bidnext'><IoChevronForwardOutline/></div> */}
                            <div className='biddetails'>
                                {/* <div className='bidbase'>
                                    <div className='bidbrand'>{currBid.brand}</div>
                                </div> */}
                                <img alt="bidimages" src={auctionImages[auction.src]} className='bidimg'/>
                                {/* <div className='bidlive'>LIVE</div> */}
                                <div className={'bidlive '+(targetTimers[index]<=0?' bidended':'')}>
                                    {startTimers[index]>0 && 'LIVE SOON'}
                                    {targetTimers[index]<=bidPeriod && targetTimers[index] >=0 && 'LIVE'}
                                    {targetTimers[index]<=0 && 'LIVE ENDED'}
                                </div>
                                <div className='bidname'>{auction.name}</div>
                                <div className='biddesc'>{auction.description}</div>
                                <div className='auctionlive'>
                                    <div className='auctionbids'>
                                        <div className='bid-no'>{auction.bids}</div>
                                        <div>All Bids</div>
                                    </div>
                                    <div className='auctionbiders'>
                                        <div className='bid-no'> {auction.biders.length}</div>
                                        <div>Bidders</div>
                                    </div>

                                    {userRecord!==null && <div className='myauctionbids'>
                                        <div className='bid-no'>{auction.mybids}</div>
                                        <div>Your Bids</div>
                                    </div>}
                                </div>
                                {startTimers[index]>0 && <div className='auctiontimer bidauctiontimer'>
                                    <div>Live in</div>
                                    <div className='timervalue'>{starting}</div>
                                </div>}

                                {targetTimers[index]<=bidPeriod && targetTimers[index]>=0 && <div className='auctiontimer bidauctiontimer'>     
                                    <div>Ends in</div>
                                    <div className='timervalue'>{ending}</div>
                                </div>}
                                <div className='mobilebidlive' onClick={()=>{
                                    setViewBidEntry(true)
                                    setBidSuccessful(false)
                                    setBiditemindex(index)
                                    window.localStorage.setItem('curbid',JSON.stringify(auction))
                                }}>Make Your Bid</div>

                            </div>
                            {<div className={'bidentry'+(viewBidEntry?'':' viewbidentry')}>
                                <IoMdArrowRoundBack className='leavebidentry' onClick={()=>{
                                    setViewBidEntry(false)
                                }}/>
                                <div className='bidentrytitle'>
                                    <div className='entrytitle'>{'₦'+(auction.bidprice?Number(auction.bidprice).toLocaleString():auction.initialprice)}</div>
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
                                        placeholder={'> ₦'+(auction.bidprice?Number(auction.bidprice).toLocaleString():auction.initialprice)}
                                    />
                                    <div className='userbidbtn' onClick={makeBid}>{targetTimers[index]<=bidPeriod && targetTimers[index] >=0 ? bidMessage :'NOT AVAILABLE'}</div>
                                </div>
                            </div>}
                        </div>
                    )
                }):
                
                    <div>Loading...</div>
                }
            </Carousel>
            </header>
            <main className='main bidmain'></main>
            <footer className='footer'></footer>
        </>
    )
}

export default Bidding