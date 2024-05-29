import './Bidding.css'
import ContextProvider from '../../Resources/ContextProvider'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoMdArrowRoundBack } from "react-icons/io";
const Bidding = ()=>{
    const {storePath, userRecord, currBid, 
        setCurrBid, setLoginMessage, auctionImages
    } = useContext(ContextProvider)
    const [viewBidEntry, setViewBidEntry] = useState(false)
    const Navigate = useNavigate()
    useEffect(()=>{
        setCurrBid(JSON.parse(window.localStorage.getItem('currbid')))        
    },[])
    useEffect(()=>{
        storePath('bidding')
    },[])
    const  makeBid = ()=>{
        if(userRecord===null){
            Navigate('/login')
            setLoginMessage("Kindly Login to Make Your Bid")
        }else{

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
    const [startTimer, setStartTimer] = useState(calculateTimeLeft(currBid.start));
    const [targetTimer, setTargetTimer] = useState(calculateTimeLeft(currBid.target));
    
    useEffect(() => {
        const startTimerInterval = setInterval(() => {
            setStartTimer(calculateTimeLeft(currBid.start));
        }, 1000);
    
        return () => clearInterval(startTimerInterval);
    }, [currBid]);
    
    useEffect(()=>{
        const targetTimerInterval = setInterval(() => {
            setTargetTimer(calculateTimeLeft(currBid.target));
        }, 1000);
    
        return () => clearInterval(targetTimerInterval);
    
    },[currBid])
    const starting = getTimerString(startTimer)
    const ending = getTimerString(targetTimer)
    const bidPeriod = (currBid.target-currBid.start)
    return(
        <>
            <header className='hheader bidheader'>
                {currBid!==null && auctionImages!==null && <div className='biddingcover'>
                    <div className='biddetails'>
                        {/* <div className='bidbase'>
                            <div className='bidbrand'>{currBid.brand}</div>
                        </div> */}
                        <img src={auctionImages[currBid.src]} className='bidimg'/>
                        {/* <div className='bidlive'>LIVE</div> */}
                        <div className={'bidlive '+(targetTimer<=0?' bidended':'')}>
                            {startTimer>0 && 'LIVE SOON'}
                            {targetTimer<=bidPeriod && targetTimer >=0 && 'LIVE'}
                            {targetTimer<=0 && 'LIVE ENDED'}
                        </div>
                        <div className='bidname'>{currBid.name}</div>
                        <div className='biddesc'>{currBid.description}</div>
                        <div className='auctionlive'>
                            <div className='auctionbids'>
                                <div className='bid-no'>{currBid.bids}</div>
                                <div>All Bids</div>
                            </div>
                            <div className='auctionbiders'>
                                <div className='bid-no'> {currBid.biders.length}</div>
                                <div>Bidders</div>
                            </div>

                            {userRecord!==null && <div className='myauctionbids'>
                                <div className='bid-no'>{currBid.mybids}</div>
                                <div>Your Bids</div>
                            </div>}
                        </div>
                        {startTimer>0 && <div className='auctiontimer bidauctiontimer'>
                            <div>Live in</div>
                            <div className='timervalue'>{starting}</div>
                        </div>}

                        {targetTimer<=bidPeriod && targetTimer>=0 && <div className='auctiontimer'>     
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
                            <div className='entrytitle'>{'₦'+currBid.initialprice}</div>
                            <div className='entrycardlabel'>HIGHEST BID SO FAR</div>
                        </div>
                        <div className='userbidcard'>
                            <label>WHAT'S YOUR BID?</label>
                            <input 
                                className='lgninp bidinp'
                                type='number'
                                placeholder={'> ₦'+currBid.initialprice}
                            />
                            <div className='userbidbtn' onClick={makeBid}>POST BID</div>
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