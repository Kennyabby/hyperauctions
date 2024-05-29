import './Bidding.css'
import ContextProvider from '../../Resources/ContextProvider'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
const Bidding = ()=>{
    const {storePath, userRecord, currBid, fetchServer,
        setCurrBid, setLoginMessage, 
        auctionImages,server, loadAuctions
    } = useContext(ContextProvider)
    const [bidMessage, setBidMessage] = useState('MAKE BID')
    const [curBid, setCurBid] = useState(JSON.parse(window.localStorage.getItem('currbid')))
    const [viewBidEntry, setViewBidEntry] = useState(false)
    const [bidvalue, setBidvalue] = useState('')
    const [bidStatus, setBidStatus] = useState('')
    const Navigate = useNavigate()
    useEffect(()=>{
        // console.log(currBid)
        // setCurrBid(JSON.parse(window.localStorage.getItem('currbid')))        
        setCurBid(JSON.parse(window.localStorage.getItem('currbid')))
    },[currBid,window.localStorage.getItem('currbid')])
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
                price = curBid.initialprice.split('').filter((chr)=>{
                    return chr!==','
                }).join('')

                var bidprice = ''
                bidprice = curBid.bidprice.split('').filter((chr)=>{
                    return chr!==','
                }).join('')

                if(bidvalue>price && bidvalue>bidprice){  
                    setBidMessage('BIDDING')              
                    console.log('before loading auctions:',curBid)
                    loadAuctions()
                    setTimeout(async()=>{
                        console.log('after loading auctions for 3s:',curBid)
                        const auctionbiders = !curBid.biders.includes(curBid._id)?curBid.biders.concat(curBid._id):currBid.biders
                        const updateField = {
                            bidprice: bidvalue,
                            bids: Number(curBid.bids)+1,
                            biders: auctionbiders,
                            bidersno: auctionbiders.length
                        }
                        console.log( bidvalue,price,curBid.bidprice,'bidding')
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
                                setBidMessage('MAKE BID')
                                setTimeout(()=>{
                                    console.log('after updating bid and loading auctions in 3s:',curBid)
                                },3000)
                                setViewBidEntry(false)
                            }
                        }                    
                       
                    },3000)
                }                
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
    const [startTimer, setStartTimer] = useState(calculateTimeLeft(curBid.start));
    const [targetTimer, setTargetTimer] = useState(calculateTimeLeft(curBid.target));
    
    useEffect(() => {
        const startTimerInterval = setInterval(() => {
            setStartTimer(calculateTimeLeft(curBid.start));
        }, 1000);
    
        return () => clearInterval(startTimerInterval);
    }, [curBid]);
    
    useEffect(()=>{
        const targetTimerInterval = setInterval(() => {
            setTargetTimer(calculateTimeLeft(curBid.target));
        }, 1000);
    
        return () => clearInterval(targetTimerInterval);
    
    },[currBid])
    const starting = getTimerString(startTimer)
    const ending = getTimerString(targetTimer)
    const bidPeriod = (curBid.target-curBid.start)
    return(
        <>
            <header className='hheader bidheader'>
                {curBid!==null && auctionImages!==null && <div className='biddingcover'>
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