import './Categories.css'
import { useState, useEffect, useRef, useContext } from "react";
import ContextProvider from '../../../Resources/ContextProvider';
import Spinner from '../../../Resources/SpecialComponents/Spinner';
import { MdAdd } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { FaCloudArrowUp } from "react-icons/fa6";
import { MdOutlineCancel } from "react-icons/md";

const Categories = ()=>{
    const [selectedCard, setSelectedCard] = useState(null)
    const [addCategory, setAddCategory] = useState(false)
    const [curCategory, setCurCategory] = useState({})
    const [edittingCategory, setEdittingCategory] = useState({})
    const [updateTitle, setUpdateTitle] = useState('New')
    const [updating, setUpdating] = useState(false)
    const {
        server, fetchServer,auctionItems,
        categories, setCategories, getCategories
    } = useContext(ContextProvider)
    const defaultFields = {
        category:'',
        description:''
    }
    const [fields, setFields] = useState(defaultFields)

    useEffect(()=>{
        if (edittingCategory.category){
            setFields((fields)=>{
                return {
                    ...fields,
                    category:edittingCategory.category,
                    description:edittingCategory.description
                }
            })
        }
    },[edittingCategory])
    const handleCardSelection = (e)=>{
        const name = e.target.getAttribute('name')
        if (![null,undefined].includes(name)){
            setSelectedCard(name)

        }
    }   

    const handleFieldChange = (e)=>{
        const name = e.target.getAttribute('name')
        const value = e.target.value

        setFields((fields)=>{
            return {...fields, [name]:value}
        })
    }

    const handleCategoryUpdate = async()=>{
        setUpdating(true)
        if (fields.category){
            if (updateTitle==='Add'){
                const newCategory = {
                    ...fields,
                    auctionItems: [],
                    createdAt: Date.now()
                }
                const newCategories = [newCategory, ...categories]
                const resps = await fetchServer("POST", {
                    database: 'AuctionSettings',
                    collection: "Categories", 
                    update: newCategory
                }, "createNewDoc", server)
                
                if (resps.err){
                    setUpdating(false)
                    console.log(resps.mess)
                }else{
                    setUpdating(false)
                    setCategories(newCategories)
                    setAddCategory(false)
                    setFields(defaultFields)
                    setCurCategory(newCategory)
                    setSelectedCard(newCategory.category)                
                    getCategories()
                }
            }else if (updateTitle==='Edit'){
                const updatedCategory = {
                    ...fields,
                    auctionItems: edittingCategory.auctionItems? edittingCategory.auctionItems: [],
                    createdAt: edittingCategory.createdAt? edittingCategory.createdAt : Date.now()
                }
                const filteredCat = categories.filter((cat)=>{
                    return cat.category!==edittingCategory.category
                })
                const updatedCategories = [updatedCategory, ...filteredCat]
                const resps = await fetchServer("POST", {
                    database: 'AuctionSettings',
                    collection: "Categories", 
                    prop: [{category: edittingCategory.category}, updatedCategory]
                }, "updateOneDoc", server)
                  
                if (resps.err){
                    setUpdating(false)
                    console.log(resps.mess)
                }else{
                      setUpdating(false)
                      setCategories(updatedCategories)
                      setAddCategory(false)
                      setFields(defaultFields)
                      setCurCategory(updatedCategory)
                      setSelectedCard(updatedCategory.category) 
                      setEdittingCategory({})               
                      getCategories()
                }
            }
        }
    }
    return(
        <>
           <div className='categories'>
                <div className='sectlist'>
                    {addCategory && 
                        <div className='addblock'>
                            <div className='updateicondiv'>
                                {updating ? <Spinner
                                    diameter='8'
                                    defaultcolor='rgba(0, 0, 0, 0.1)'
                                    loadingcolor='darkblue'
                                    borderwidth='3'
                                    spintime='1'
                                /> : <FaCloudArrowUp className='updateicon'
                                    onClick={handleCategoryUpdate}
                                    aria-disabled = {updating}
                                />}
                                <MdOutlineCancel className='updateicon deleteicon'
                                    onClick={()=>{
                                        setUpdating(false)
                                        setAddCategory(false)
                                        setEdittingCategory({})
                                    }}
                                />
                            </div> 
                            <div className='updatetitle'>{updateTitle+' Category'}</div>
                            <div className='updateinput' 
                                onChange={handleFieldChange}
                            >
                                <div className='inpcov'>
                                    <div className='inplbl'>Name</div>
                                    <input
                                        className='inp'
                                        type='text'
                                        name='category'
                                        placeholder='Name'
                                        value={fields.category}
                                    />
                                </div>
                                <div className='inpcov'>
                                    <div className='inplbl'>Description</div>
                                    <textarea
                                        className='inparea'
                                        type='text'
                                        name='description'
                                        placeholder='Category Description'
                                        value={fields.description}
                                    />
                                </div>
                            </div>
                        </div>
                    }
                    {categories ? categories.filter((fltcategory)=>{
                        return (fltcategory.category!==edittingCategory.category)
                    }).map((category,index)=>{
                        return(
                            <div 
                                key={index} 
                                name={category.category} 
                                className={'sectcard' + (selectedCard === category.category ? ' sectcardselected': '')}
                                onClick={(e)=>{
                                    setCurCategory(category)
                                    console.log(category)
                                    handleCardSelection(e)
                                }}
                            >
                                <div className={(curCategory.category === category.category)?'showselected':'secticondiv'}>
                                    <CiEdit className='secticon'
                                        onClick={()=>{
                                            setEdittingCategory(category)      
                                            setSelectedCard(category.category)                                                                                     
                                            setUpdateTitle('Edit')
                                            setAddCategory(true)
                                        }}
                                    />
                                    <MdDelete className='secticon deleteicon'/>
                                </div>                                
                                <div className='sectcardname' name={category.category}>{category.category.toUpperCase()}</div>
                                <div className='sectcarddesc' name={category.category}>{category.description}</div>
                                {/* <div>{}</div> */}
                            </div>
                        )
                    }):<div>
                            <Spinner
                                diameter='20'
                                defaultcolor='rgba(0, 0, 0, 0.1)'
                                loadingcolor='darkblue'
                                borderwidth='3'
                                spintime='1'
                            />
                        </div>}
                </div>
                <div className='sectview'>
                    <MdAdd className='sectadd'
                        onClick={()=>{
                            setFields({...defaultFields})
                            setUpdateTitle('New')
                            setAddCategory(true)
                        }}
                    />
                </div>
            </div>             
        </>
    )
}

export default Categories