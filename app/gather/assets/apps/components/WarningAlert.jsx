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

import React, { Component } from 'react'
import { hot } from 'react-hot-loader/root'

/**
 * WarningAlert component.
 *
 * Renders a list of alert messages indicating the warnings that happened
 * while executing any action.
 */

class WarningAlert extends Component {
  render () {
    const { warnings } = this.props
    if (!warnings || !warnings.length) {
      return <div />
    }

    return (
      <div data-qa='data-warning' className='form-warning'>
        {
          warnings.map((warning, index) => (
            <p key={index} data-qa={`data-warning-${index}`} className='warning'>
              {warning}
            </p>
          ))
        }
      </div>
    )
  }
}

// Include this to enable HMR for this module
export default hot(WarningAlert)
