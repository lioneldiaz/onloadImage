import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Modal from 'react-modal'
import FaTimesCircle from 'react-icons/lib/fa/times-circle'
import { readFileAsDataURL, resizeImage, resizeToInput } from '../utils/helpers'
import '../App.css'
import { gray } from '../utils/colors'

class ImageInput extends Component {
  /**
   * @description Represent App
   */
  constructor() {
    super()
    this.state = {
      url: '',
      angle: 180,
      show: false,
      save: false
    }
  }
  /**
   * @description Validate of the data types passed to the component
   */
  static propTypes = {
    className: PropTypes.string,
    name: PropTypes.string,
    sizeInput: PropTypes.number.isRequired
  }
  /**
   * @description Close the modal
   */
  closeWindow = () => this.setState(() => ({show: false}))
    
  /**
   * @description Region to capture a part of the image
   */
  drawRegion = () => {
    let mousePosition
    let offset = [0,0]
    let isDown = false
    let div = document.createElement('div')
    div.setAttribute('id','mark')
    div.style.position = 'absolute'
    div.style.left = '10px'
    div.style.top = '50px'
    div.style.border ='1px solid white'
    div.style.borderStyle = 'dashed'

    let canva = this.canva
    if (canva.offsetHeight >= canva.offsetWidth) {
      div.style.width = `${canva.offsetWidth}px`
      div.style.height = `${canva.offsetWidth}px`
    }
    else {
      div.style.width = `${canva.offsetHeight}px`
      div.style.height = `${canva.offsetHeight}px`
    }
    
    document.getElementById('box').appendChild(div)    
   
    div.addEventListener('mousedown', function(event) {
      isDown=true
      offset = [
        div.offsetLeft - event.clientX,
        div.offsetTop - event.clientY
      ]
    }, true)
    div.addEventListener('mouseup', function() {
      isDown = false
    }, true)    
    
    div.addEventListener('mousemove', function(event) {
      event.preventDefault()        
      if (isDown) {
        mousePosition = {
            x : event.clientX,
            y : event.clientY
        }
        let left = mousePosition.x + offset[0]
        let top = mousePosition.y + offset[1]
        div.style.left = `${left}px`
        div.style.top = `${top}px`        
      }     
    }, true)
  }
  /**
   * @description Invoke immediately after Modal is load
   */
  afterOpenModal = () => { 
    document.getElementById('box').appendChild(this.canva)
    this.drawRegion()
  }
  /**
   * @description Rotate image 180 degree
   */
  rotate = () => {
    const { width, height } = this.canva
    const context = this.canva.getContext('2d')
    const image = context.getImageData(0,0, width, height)
    context.clearRect(0, 0, width, height) 
    context.translate(width/2, height/2)
    context.rotate(180 * Math.PI/180)
    context.translate(-width/2, -height/2)
    context.putImageData(image, 0, 0)
    context.drawImage(this.canva, 0, 0, width, height, 0, 0, width, height)
  }
  /**
   * @description Get a specific part of the image
   */
  getImage = () => {    
    /**
     * @description Take the coordinates of the image
     */    
    const v = document.getElementById('mark')
    let sx = parseInt(v.style.left.slice(0,-2)) - 10
    let sy = parseInt(v.style.top.slice(0,-2)) - 50
    /**
     * @description To caught the image in the canava
     */
    const ctx = this.canva.getContext('2d')
    const div = document.getElementById('mark')
    let divWidth = div.offsetWidth
    let divHeight = div.offsetHeight

    const imgData = ctx.getImageData(sx,sy,divWidth,divHeight)
    
    ctx.clearRect(0, 0, this.canva.offsetWidth, this.canva.offsetHeight)
    this.canva.width = divWidth
    this.canva.height = divHeight
    
    ctx.putImageData(imgData, 0, 0)
    resizeToInput(this.canva, {divWidth, divHeight}, this.props.sizeInput)
      .then(url => {
        this.setState(() => ({url}))
      })

    this.setState(() => ({save: true})) 
    this.closeWindow()
  }

  handleFormReset = () => {
    this.setState(() => ({url: ''}))
  }
  /**
   * @description Invoke immediately after the component is inserted in the DOM.
   */
  componentDidMount () {    
    this.canva = document.createElement('canvas')
    this.fileInput.form.addEventListener('reset', this.handleFormReset) 
  }
  componentWillUnmount () {
    this.fileInput.form.removeEventListener('reset', this.handleFormReset)
  }
  /**
   * @description Handle any change in the input
   */
  handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type.match(/^image\//)) {
      readFileAsDataURL(file).then(originalURL => {
        resizeImage(originalURL, this.canva, 400).then(() => {
          this.setState({
            show: true
          })
        })
      })
    } else {
      this.setState(() => ({ url: '' }))
    }
  }
  render() {
    const { className, name } = this.props
    const { show, url } = this.state
    const style = {
      position: 'relative'      
    }
    if (url) {
      style.backgroundImage = `url("${url}")`
      style.backgroundRepeat = 'no-repeat'
      style.backgroundPosition = 'center'
      style.backgroundSize = 'cover'
    }
    if (show) {
      return (
        <Modal
          isOpen={this.state.show}
          onRequestClose={this.closeWindow}
          onAfterOpen={this.afterOpenModal}
          className="Modal"
          overlayClassName='overlay'
          ariaHideApp={false}
        >
        <div id="container" className="flex-container">
          <div id="title" className="title">
            <div className="div-title">Crop your picture</div>
            <div className="div-title-btn">
              <button className="icon-btn" onClick={this.closeWindow}>
                <FaTimesCircle size={15} style={{color:gray}}/>              
              </button>
            </div>
          </div>
          <div id="box" className="box" />     
          <div id="button" className="button">
            <button onClick={this.getImage}>
              Save
            </button>
            <button onClick={this.rotate}>
              Rotate
            </button>
          </div>
        </div>
        </Modal>
      )
    }
    return (
      <div className={className} style={style}>
        <input type="hidden" name={name} value={url} />
        <input
          ref={node => this.fileInput = node}
          type="file"
          onChange={this.handleFileChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0
          }}
        />
      </div>
    )
  }
}
export default ImageInput
