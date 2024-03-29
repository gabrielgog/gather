/*
 * Copyright (C) 2019 by eHealth Africa : http://www.eHealthAfrica.org
 *
 * See the NOTICE file distributed with this work for additional information
 * regarding copyright ownership.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader/root'

// https://reactjs.org/docs/portals.html

class Portal extends React.Component {
  constructor (props) {
    super(props)
    this.element = document.createElement('div')

    this.onKeyDown = (event) => {
      if (event.key === 'Escape') {
        this.props.onEscape && this.props.onEscape()
      }
      if (event.key === 'Enter') {
        this.props.onEnter && this.props.onEnter()
      }
    }
  }

  componentDidMount () {
    document.body.appendChild(this.element)
    document.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount () {
    document.body.removeChild(this.element)
    document.removeEventListener('keydown', this.onKeyDown)
  }

  render () {
    return ReactDOM.createPortal(
      this.props.children,
      this.element
    )
  }
}

// Include this to enable HMR for this module
export default hot(Portal)
