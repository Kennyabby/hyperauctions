import './PanelAuctions.css'
import { useState, useEffect, useRef, useContext } from "react";
import Spinner from '../../../Resources/SpecialComponents/Spinner';
import ToggleSwitch from '../../../Resources/SpecialComponents/ToggleSwitch';
import ContextProvider from '../../../Resources/ContextProvider';
import { PiClockCountdownBold } from 'react-icons/pi';
import { MdAdd } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { FaCloudArrowUp } from "react-icons/fa6";
import { MdOutlineCancel } from "react-icons/md";
import { IoImageOutline } from "react-icons/io5";

const PanelAuctions = ({panelauctRef})=>{
    const [selectedCard, setSelectedCard] = useState(null)
    const [addAuction, setAddAuction] = useState(false)
    const [curAuction, setCurAuction] = useState({})
    const [edittingAuction, setEdittingAuction] = useState({})
    const [deletingAuctions, setDeletingAuctions] = useState([])
    const [updateTitle, setUpdateTitle] = useState('New')
    const [updating, setUpdating] = useState(false)
    const [deleting, setDeleting] = useState(false)
  const {
    server, fetchServer, loadAuctions,
    auctionItems, auctionImages, categories, setAuctionItems,
    userAuctions, userRecord
  } = useContext(ContextProvider)
  const [clearBids, setClearBids] = useState(false)
  const defaultFields = {
    name:'',
    description:'',
    brand:'',
    src:'',
    type:'',
    initialprice:'',
    start:'',
    target:''
  }
  const [fields, setFields] = useState(defaultFields)

  useEffect(()=>{
    if (edittingAuction._id){
      setFields({
        name:edittingAuction.name,
        description:edittingAuction.description,
        brand:edittingAuction.brand,
        src:edittingAuction.src,
        type:edittingAuction.type,
        initialprice:edittingAuction.initialprice,
        start:toDatetime(edittingAuction.start),
        target:toDatetime(edittingAuction.target)
      })
    }
  },[edittingAuction])

  function toDatetime(timestamp) {
    const date = new Date((timestamp + _getTimeZoneOffsetInMs()));
    // slice(0, 19) includes seconds
    return date.toISOString().slice(0, 19);
  }
  
  function _getTimeZoneOffsetInMs() {
    return new Date().getTimezoneOffset() * -60 * 1000;
  }
  function timestampToDatetimeLocal(timestamp) {
    const date = new Date(timestamp * 1000); // Convert timestamp to Date object

    // Get the local date in the format 'YYYY-MM-DDTHH:MM'
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Return formatted date for datetime-local
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  const dateTimeToTimestamp = (datetime)=>{
    const [datePart, timePart] = String(datetime).split('T'); // Split date and time parts
    const [year, month, day] = datePart.split('-').map(Number); // Split and parse date
    const [hours, minutes] = timePart.split(':').map(Number); // Split and parse time

    // Create a Date object using local time components
    const date = new Date(year, month - 1, day, hours, minutes); // Month is zero-indexed

    // Return the Unix timestamp (in seconds)
    return date.getTime()
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

  const handleAuctionField = (e)=>{
    const name = e.target.getAttribute('name')
    const value = e.target.value

    setFields((fields)=>{
        return {...fields, [name]:value}
    })

  }

  const handleAuctionUpdate = async()=>{
    setUpdating(true)
    if (fields.name){
      if (updateTitle==='Add'){
        const newAuction = {
            ...fields,
            biders:[],
            bidersNo:0,
            bids:0,
            mybids:0,
            bidprice:"",
            createdAt: Date.now(),
        }
        const newAuctions = [newAuction, ...auctionItems]
        const resps = await fetchServer("POST", {
            database: 'AuctionItems',
            collection: "all", 
            update: newAuction
        }, "createNewDoc", server)
        
        if (resps.err){
            setUpdating(false)
            console.log(resps.mess)
        }else{
            setUpdating(false)
            setAuctionItems(newAuctions)
            setAddAuction(false)
            setFields(defaultFields)
            loadAuctions({user:userRecord, reload:true})
        }
      }else if (updateTitle==='Edit'){
          const updatedAuction = {
              ...edittingAuction,  
            ...fields,
            createdAt:edittingAuction.createdAt?edittingAuction.createdAt:Date.now(),
            start: fields.start === toDatetime(edittingAuction.start) ? edittingAuction.start: dateTimeToTimestamp(fields.start),
            target: fields.target === toDatetime(edittingAuction.target) ? edittingAuction.target: dateTimeToTimestamp(fields.target),
            bids:clearBids? 0 : edittingAuction.bids,
            bidersno:clearBids? 0 : edittingAuction.bidersno,
            mybids:clearBids? 0 : edittingAuction.mybids,
            biders:clearBids? []: edittingAuction.biders,
            bidprice:clearBids? '' : edittingAuction.bidprice
          }
          const filteredAuc = auctionItems.filter((auc)=>{
            return auc._id!==edittingAuction._id
          })
          const auctionId = updatedAuction._id
          delete updatedAuction._id
          
          const resps = await fetchServer("POST", {
            database: 'AuctionItems',
            collection: "all", 
            prop: [{
              name: edittingAuction.name, 
              description:edittingAuction.description
            }, updatedAuction]
          }, "updateOneDoc", server)
          
          if (resps.err){
            setUpdating(false)
            setClearBids(false)
            console.log(resps.mess)
          }else{
                updatedAuction._id = auctionId
                const updatedAuctions = [updatedAuction, ...filteredAuc]
                setEdittingAuction({})
                setAuctionItems(updatedAuctions)
                setUpdating(false)
                setClearBids(false)
                setAddAuction(false)
                setFields(defaultFields)
                loadAuctions({user:userRecord, reload:true})                
          }
      }
  }

}
const deleteAuction = async(auction)=>{
    const filteredAuc = auctionItems.filter((auc)=>{
      return auc._id!==auction._id
    })
    const resps = await fetchServer("POST", {
        database: 'AuctionItems',
        collection: "all", 
        update: {
          name: auction.name, 
          description:auction.description
        }
    }, "removeDoc", server)
    if (resps.err){
        setDeleting(false)
        setClearBids(false)
        console.log(resps.mess)
    }else{
      setAuctionItems(filteredAuc)
      setDeleting(false)
      setDeletingAuctions((deletingAuctions)=>{
        const remainingAuctions = deletingAuctions.filter((delauction)=>{
          return delauction._id !== auction._id
        })
        return remainingAuctions
      })
      setClearBids(false)
      setAddAuction(false)
      setFields(defaultFields)
      loadAuctions({user:userRecord, reload:true})
    }
}
  return (
    <div className='panelauctions'>
        
        {addAuction && <div className='paneladdblock' 
            onChange={handleAuctionField}
        >
            <div className='panelupdateicondiv'>
                <MdOutlineCancel className='panelupdateicon deleteicon'
                    onClick={()=>{
                        setUpdating(false)
                        setAddAuction(false)
                        setClearBids(false)
                        setEdittingAuction({})
                    }}
                />
                {updating ? <Spinner
                    diameter='8'
                    defaultcolor='rgba(0, 0, 0, 0.1)'
                    loadingcolor='darkblue'
                    borderwidth='3'
                    spintime='1'
                /> : <FaCloudArrowUp className='panelupdateicon'
                    onClick={handleAuctionUpdate}
                    aria-disabled = {updating}
                />}                
            </div>
            {edittingAuction._id ? <img src={auctionImages[edittingAuction.src]} className='addauctionpanelimg' alt={edittingAuction.name} /> :
            <div className='addauctionpanelimg'> 
              <IoImageOutline/>
              <div>+</div>
            </div>}
           {updateTitle==='Edit'&&<div className='panelinpcov'>
              <div className='panelinplbl'>Clear Bids</div>
              <ToggleSwitch 
                size={40}
                setToggleState = {(isToggleState)=>{
                  setClearBids(isToggleState)
                }}
              />
            </div>}
            <div className='panelinpcov'>
                <input
                    className='panelinp'
                    name='name'
                    placeholder='Auction Name'
                    type='text'
                    value={fields.name}
                />
            </div>
            <div className='panelinpcov'>
                <textarea
                    className='panelinparea'
                    name='description'
                    placeholder='Description'
                    type='text'
                    value={fields.description}
                />
            </div>
            <div className='panelinpcov'>
                <select
                    className='panelinp'
                    name='type'
                    placeholder='Auction Name'
                    type='text'
                    value={fields.type}
                >
                    <option value={''}>Select Category</option>
                    {categories.map((category, id)=>{
                        return(
                            <option key={id} value={category.category}>{category.category}</option>
                        )
                    })}
                </select>
            </div>
            <div className='panelinpcov'>
                <div className='panelinplbl'>Starting Price</div>
                <input
                    className='panelinp'
                    name='initialprice'
                    placeholder='Starting Price'
                    type='text'
                    value={fields.initialprice}
                />
            </div>
            <div className='panelinpcov'>
                <div className='panelinplbl'>Start Time</div>
                <input
                    className='panelinp'
                    name='start'
                    type='datetime-local'
                    value={fields.start}
                />
            </div>
            <div className='panelinpcov'> 
                <div className='panelinplbl'>End Time</div>
                <input
                    className='panelinp'
                    name='target'
                    type='datetime-local'
                    value={fields.target}
                />
            </div>
        </div>}
      {((userRecord===null && auctionItems.length) || userAuctions!==null) ? (auctionItems.length ? (auctionItems.slice(0,).filter((fltauction)=>{
        return fltauction._id !== edittingAuction._id
      }).map((auction, index) => {
        const starting = getTimerString(startTimers[index])
        const ending = getTimerString(targetTimers[index])
        const bidPeriod = (auction.target-auction.start)
        return (
          <div className='panelauctioncard' key={String(index)+auction._id} name={auction._id}>
            <div className={deletingAuctions.includes(auction)? 'paneldelsecticondiv': 'panelsecticondiv'}>
                {!deletingAuctions.includes(auction) && <CiEdit className='panelsecticon'
                    onClick={()=>{
                        setEdittingAuction(auction)      
                        setSelectedCard(auction._id)                                                                                     
                        setUpdateTitle('Edit')
                        setAddAuction(true)
                        panelauctRef.current.scrollTo({
                          top: 0,
                          behavior: 'smooth'
                        })
                    }}
                />}
                {!(targetTimers[index]<=bidPeriod && targetTimers[index] >=0) && 
                  ((deleting && deletingAuctions.includes(auction))? 
                    <Spinner
                    diameter='8'
                    defaultcolor='rgba(0, 0, 0, 0.1)'
                    loadingcolor='red'
                    borderwidth='3'
                    spintime='1'
                  /> :
                    <MdDelete 
                      className='panelsecticon deleteicon'
                      onClick={()=>{
                        setDeletingAuctions((deletingAuctions)=>{
                          return [...deletingAuctions,auction]
                        })
                        setDeleting(true)
                        deleteAuction(auction)
                      }}
                    />
                  )
                }
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
                panelauctRef.current.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                })
            }}
        />
    </div>
    </div>
  );
}

export default PanelAuctions