import './PanelAuctions.css'
import { useState, useEffect, useRef, useContext } from "react";
import Spinner from '../../../Resources/SpecialComponents/Spinner';
import ContextProvider from '../../../Resources/ContextProvider';
import { PiClockCountdownBold } from 'react-icons/pi';
import { MdAdd } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { FaCloudArrowUp } from "react-icons/fa6";
import { MdOutlineCancel } from "react-icons/md";

const PanelAuctions = ()=>{
    const [selectedCard, setSelectedCard] = useState(null)
    const [addAuction, setAddAuction] = useState(false)
    const [curAuction, setCurAuction] = useState({})
    const [edittingAuction, setEdittingAuction] = useState({})
    const [updateTitle, setUpdateTitle] = useState('New')
    const [updating, setUpdating] = useState(false)
  const {
    server, fetchServer, 
    auctionItems, auctionImages, 
    userAuctions, userRecord
  } = useContext(ContextProvider)
  const defaultFields = {
    category:'',
    description:''
  }
  const [fields, setFields] = useState(defaultFields)
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

  function formatDate(datetime) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = new Date(datetime)
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dayOfMonth = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // return `${day}, ${month} ${dayOfMonth}, ${year} ${hours}:${minutes}:${seconds}`;
    return `${month} ${dayOfMonth}, ${year}`;
  }
  const [startTimers, setStartTimers] = useState(
    auctionItems.map((auction) => calculateTimeLeft(auction.start))
  );

  const [targetTimers, setTargetTimers] = useState(
    auctionItems.map((auction) => calculateTimeLeft(auction.start))
  );

  useEffect(() => {
    const startTimerInterval = setInterval(() => {
      setStartTimers(
        auctionItems.map((auction) => calculateTimeLeft(auction.start))
      );
    }, 1000);
  
    return () => clearInterval(startTimerInterval);
  }, [auctionItems]);

  useEffect(()=>{
    const targetTimerInterval = setInterval(() => {
      setTargetTimers(
        auctionItems.map((auction) => calculateTimeLeft(auction.target))
      );
    }, 1000);

    return () => clearInterval(targetTimerInterval);

  },[auctionItems])
  return (
    <div className='panelauctions'>
      {((userRecord===null && auctionItems.length) || userAuctions!==null) ? (auctionItems.length ? (auctionItems.slice(0,).map((auction, index) => {
        const starting = getTimerString(startTimers[index])
        const ending = getTimerString(targetTimers[index])
        const bidPeriod = (auction.target-auction.start)
        return (
          <div className='panelauctioncard' key={String(index)+auction._id} name={auction._id}>
            <div className='panelsecticondiv'>
                <CiEdit className='panelsecticon'
                    onClick={()=>{
                        setEdittingAuction(auction)      
                        setSelectedCard(auction._id)                                                                                     
                        setUpdateTitle('Edit')
                        setAddAuction(true)
                    }}
                />
                {!(targetTimers[index]<=bidPeriod && targetTimers[index] >=0) && <MdDelete className='panelsecticon deleteicon'/>}
            </div>
            {/* <PiClockCountdownBold className='panellivecountdown'/> */}
            <div className='panelauctioncardtitle'>
              <div className={'panelauctionstatus'+(targetTimers[index]<=0?' panelbidended':'')}>
                <div>
                  {startTimers[index]>0 && 'Live Soon'}
                  {targetTimers[index]<=bidPeriod && targetTimers[index] >=0 && 'Live'}
                  {targetTimers[index]<=0 && 'Live Ended'}
                </div>
              </div>
              <div className='panelauctionpricediv'> 
                <div className='panelauctionprice'>
                  {'₦'+auction.initialprice}
                </div>
                <div className='panelstartingprice'>Starting price:</div>
              </div>
            </div>
            <img src={auctionImages[auction.src]} className='panelauctionimg' alt={auction.name} />
            <div className='panelauctionname'>{auction.name}</div>
            <div className='panelauctiondesc'>{auction.description}</div>
            <div className='panelauctionliveinfo'>
              <div className='panelliveinfocontent'>
                <div className='panelmaincontent'>
                  <div className='panelbidpricediv'> 
                    <div className='panelbidprice'>
                      {'₦'+(auction.bidprice?Number(auction.bidprice).toLocaleString():auction.initialprice)}
                    </div>
                    {startTimers[index] > 0 && <div className='panelbidstatus'>Highest bid so far:</div>}
                    {targetTimers[index]<=bidPeriod && targetTimers[index]>=0 && <div className='panelbidstatus'>Highest bid so far:</div>}
                    {targetTimers[index] < 0 && <div className='panelbidstatus'>Winning Price</div>}
                  </div>

                  {startTimers[index] > 0 && <div className='panelauctiontimer'>
                    <div className='paneltimer'>
                      <div className='paneltimervalue'>{formatDate(auction.start)}</div>
                      <div className='paneltimerstatus'>Starting</div>
                    </div>
                    <div className='paneltimer'>
                      <div className='paneltimervalue'>{formatDate(auction.target)}</div>
                      <div className='paneltimerstatus'>Ends by</div>
                    </div>
                  </div>}
                  {targetTimers[index]<=bidPeriod && targetTimers[index]>=0 && <div className='panelauctiontimer'>
                    <div className='paneltimer'>
                      <div className='paneltimervalue'>{formatDate(auction.start)}</div>
                      <div className='paneltimerstatus'>Started</div>
                    </div>
                    <div className='paneltimer'>
                      <div className='paneltimervalue'>{formatDate(auction.target)}</div>
                      <div className='paneltimerstatus'>Ends by</div>
                    </div>
                  </div>}
                  {targetTimers[index] < 0 && <div className='panelauctiontimer'>
                    <div className='paneltimer'>
                      <div className='paneltimervalue'>{formatDate(auction.start)}</div>
                      <div className='paneltimerstatus'>Started</div>
                    </div>
                    <div className='paneltimer'>
                      <div className='paneltimervalue'>{formatDate(auction.target)}</div>
                      <div className='paneltimerstatus'>Ended</div>
                    </div>
                  </div>}
                  {/* <div
                    className={'auctionbtn'+(targetTimers[index]<=0?' bidended':'')}
                    onClick={() => { 
                      if (targetTimers[index]>0){
                        // startBidding(auction) 
                      }
                    }}
                  >
                    {starting==='EXPIRED'?'BID NOW':(startTimers[index]<=3600000?'STARTING SOON':'UPCOMING')}
                  </div> */}
                </div>
              </div>
              <div className='panelauctionlive'>
                <div className='panelauctionbids'>
                  <div className='bid-no'>{auction.bids}</div>
                  <div>Bids</div>
                </div>
                <div className='panelauctionbiders'>
                  <div className='bid-no'> {auction.biders.length}</div>
                  <div>Bidders</div>
                </div>                
              </div>
            </div>
          </div>
        )
      })):<div>
        No Auctions at the moment
      </div>) : <div>
        <Spinner
            diameter='40'
            defaultcolor='rgba(0, 0, 0, 0.1)'
            loadingcolor='darkblue'
            borderwidth='5'
            spintime='1'
        />
      </div>
    }
    <div className='sectview'>
        <MdAdd className='sectadd'
            onClick={()=>{
                setFields({...defaultFields})
                setUpdateTitle('New')
                setAddAuction(true)
            }}
        />
    </div>
    </div>
  );
}

export default PanelAuctions