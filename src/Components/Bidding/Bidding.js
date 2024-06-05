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
    const [bidvalues, setBidvalues] = useState([])
    const [bidStatus, setBidStatus] = useState('')
    const [biditemindex, setBiditemindex] = useState(0)    
    const [liveAuctions, setLiveAuctions] = useState([])
    const [dateNow, setDateNow] = useState(Date.now())
    const [bidderAuctionUpdated, setBidderAuctionUpdated] = useState(false)
    const [auctionItemUpdated, setAuctionItemUpdated] = useState(false)
    const Navigate = useNavigate()

    useEffect(()=>{
        const dateTimeInterval = setInterval(()=>{
            setDateNow(Date.now())
        },1000)
        return ()=> clearInterval(dateTimeInterval) 
    },[auctionItems])

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
                // console.log(index, auction._id, bid._id)
                if (auction._id === bid._id){               
                    ct += 1 
                    // console.log('true value')
                    // console.log(index)
                    if (ct===1){
                        setBiditemindex(index)
                    }   
                }     
            })  
        }    
        setCurBid(bid)
    },[currBid,window.localStorage.getItem('curbid')])

    useEffect(()=>{
        storePath('bidding')
    },[])
    
    useEffect(()=>{
        setLiveAuctions(auctionItems.filter((auction)=>{
            let datenow = Date.now()
            return auction.start <= datenow && auction.target >= datenow
        }))
    },[auctionItems])

    const  makeBid = async (curBid,biditemindex)=>{
        setAuctionItemUpdated(false)
        setBidderAuctionUpdated(false)
        if(userRecord===null){
            Navigate('/login')
            setLoginMessage("Kindly Login to Make Your Bid")
        }else{
            const bidPeriod = targetTimers[biditemindex] - startTimers[biditemindex]
            const datenow = Date.now()
             if (targetTimers[biditemindex] >= datenow && startTimers[biditemindex] <= datenow){   
                var price = ''
                price = Number(curBid.initialprice.split('').filter((chr)=>{
                    return chr!==','
                }).join(''))

                var bidprice = ''
                bidprice = Number(curBid.bidprice.split('').filter((chr)=>{
                    return chr!==','
                }).join(''))
                // console.log(bidvalue,bidprice,price)
                if(Number(bidvalues[biditemindex])>price && Number(bidvalues[biditemindex])>bidprice){  
                    let currIndex = biditemindex
                    setBidMessage('BIDDING')                                 
                    loadAuctions({user:userRecord, reload:true})
                    setTimeout(async()=>{    
                        let bidders = curBid.biders
                        let mybids = [bidvalues[currIndex]]
                        let isBidding = bidders.length? bidders.map((bider)=>{
                            if (bider.bidder === userRecord._id){
                                bider.mybids = bider.mybids.concat(bidvalues[currIndex])
                                // console.log(bider,mybids)
                                return true
                            }else{
                                return false
                            }
                        }): []              

                        const firstBidders = curBid.biders.concat({bidder:userRecord._id, mybids:mybids})
                        const auctionbiders = isBidding.includes(true)? bidders: firstBidders
                        // console.log(isBidding.includes(true))
                        // console.log(bidders)
                        // console.log(firstBidders)
                        // console.log(auctionbiders)
                        const datenow = Date.now()
                        const updateField = {
                            bidprice: bidvalues[currIndex],
                            bids: Number(curBid.bids)+1,
                            biders: auctionbiders,
                            bidersno: auctionbiders.length,
                            createdAt: datenow
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
                            setAuctionItemUpdated(true)
                            // setBiditemindex(currIndex)
                        }     
                        
                       
                    },3000)
                    const resp1 = await fetchServer("POST", {
                        database: "Bidder_"+userRecord.username,
                        collection: "Auctions", 
                        update: {
                            auction: curBid._id,
                            updatedAt: datenow
                        }
                    }, "createDoc", server)
                
                    if (resp1.err){
                        setLoginMessage(resp1.mess)
                        setBidMessage('MAKE BID')
                    }else{
                        if (resp1.mess){
                            setLoginMessage(resp1.mess)
                            setBidMessage('MAKE BID')
                        }else{
                            if (resp1.isDelivered){
                                setBidderAuctionUpdated(true)
                            }
                        }
                    }               
                }else{
                    setBidStatus("Your next bid must be greater than ₦"+(curBid.bidprice?Number(curBid.bidprice).toLocaleString():curBid.initialprice))
                    setTimeout(()=>{
                        setBidStatus("")
                    },3000) 
                }                
            }else{
                setBidStatus("Bidding is not available for this item at this time")
                setTimeout(()=>{
                    setBidStatus("")
                },3000)
            }
            // console.log("promises are running.. but i'm printing anyways")
        }
    }
    useEffect(()=>{
        if (auctionItemUpdated && bidderAuctionUpdated){
            loadAuctions({user:userRecord, reload:true})
            setBidSuccessful(true)                               
            setBidStatus("Your bid was Successful") 
            setBidMessage('MAKE BID')
            setBidvalues(liveAuctions.map(()=>{
                return ""
            }))
            setTimeout(()=>{
            },3000)
            
            setTimeout(()=>{
                setBidStatus("")
                setViewBidEntry(false)
                
            },2000)
        }
    },[auctionItemUpdated, bidderAuctionUpdated])

    
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
       liveAuctions.map((auction) =>auction.start):[]);
    const [targetTimers, setTargetTimers] = useState(![null, undefined].includes(curBid)?
        liveAuctions.map((auction) => auction.target):[]);
    
    useEffect(()=>{
        if(![null, undefined].includes(curBid)){
            setStartTimers(liveAuctions.map((auction) => auction.start));
            setTargetTimers(liveAuctions.map((auction) => auction.target));
        }
    },[liveAuctions,curBid])
    
    
    return(
        <>
            <header className='hheader bidheader'>
            <Carousel 
                autoPlay= {false} 
                stopOnHover 
                interval={5000} 
                showArrows={true}
                useKeyboardArrows={!viewBidEntry}
                transitionTime={1000} 
                selectedItem={biditemindex} 
                swipeable={false}
                showThumbs={false}
                axis='horizontal'
            >
                {auctionItems.length ? liveAuctions.map((auction, index) => {
                    const startingTime = startTimers[index] - dateNow
                    const endingTime = targetTimers[index] - dateNow
                    const starting = getTimerString(startingTime)
                    const ending = getTimerString(endingTime)
                    const bidPeriod = endingTime - startingTime
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
                                    {/* {startTimers[index]>0 && 'LIVE SOON'} */}
                                    {'LIVE'}
                                    {/* {targetTimers[index]<=0 && 'LIVE ENDED'} */}
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
                                {startingTime > 0 && endingTime > 0 && <div className='auctiontimer bidauctiontimer'>
                                    <div>Live in</div>
                                    <div className='timervalue'>{starting}</div>
                                </div>}

                                {startingTime <= 0 && endingTime >= 0 && <div className='auctiontimer bidauctiontimer'>     
                                    <div>Ends in</div>
                                    <div className='timervalue'>{ending}</div>
                                </div>}
                                <div className='mobilebidlive' onClick={()=>{
                                    setViewBidEntry(true)
                                    setBidSuccessful(false)
                                    setBiditemindex(index)
                                    window.localStorage.setItem('curbid',JSON.stringify(auction))
                                    document.body.scrollTop = 0; 
                                    document.documentElement.scrollTop = 0
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
                                        name={index}
                                        value={bidvalues[index]}
                                        onChange={(e)=>{
                                            setBidvalues((bidvalues)=>{
                                                bidvalues[index] = e.target.value
                                                return [...bidvalues]
                                            })
                                        }}
                                        placeholder={'> ₦'+(auction.bidprice?Number(auction.bidprice).toLocaleString():auction.initialprice)}
                                    />
                                    <div className='userbidbtn' onClick={()=>{
                                        setBiditemindex(index)
                                        window.localStorage.setItem('curbid',JSON.stringify(auction))
                                        makeBid(auction,index)
                                    }
                                    }>{startingTime <=0 && endingTime >= 0 ? bidMessage :'NOT AVAILABLE'}</div>
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