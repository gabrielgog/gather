/*
 * Copyright (C) 2018 by eHealth Africa : http://www.eHealthAfrica.org
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
import { FormattedMessage } from 'react-intl'

import { getData } from '../utils/request'
import { buildQueryString } from '../utils/paths'

import EmptyAlert from './EmptyAlert'
import FetchErrorAlert from './FetchErrorAlert'
import LoadingSpinner from './LoadingSpinner'
import PaginationBar from './PaginationBar'
import RefreshSpinner from './RefreshSpinner'

/**
 * PaginationContainer component.
 *
 * Request paginated data from server and returns back to the provided component.
 *
 * Properties:
 *   `url`:               The url to fetch, should allow `page` and `page_size` parameters.
 *   `pageSize`:          The page size. Default to 25.
 *   `listComponent`:     The rendered component after a sucessful request.
 *                        It's going to received as properties the list of results,
 *                        the total number of results and the position number
 *                        of the first element.
 *   `position`:          Where to display the pagination bar regarding the list
 *                        component. Possible values: `top` and `bottom` (default).
 *   `search`:            Indicates if the search option it's enable.
 *   `showXxx`:           Indicates if the button `Xxx` (`First` , `Previous`, `Next`, `Last`)
 *                        is shown in the pagination bar.
 *   `extras`:            An object that passes directly to the listComponent.
 *
 */

export default class PaginationContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      // default status variables
      isLoading: true,
      pageSize: props.pageSize || 25,
      page: 1
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.pageSize !== this.state.pageSize) {
      this.setState({ pageSize: nextProps.pageSize, page: 1 })
    }
  }

  componentDidMount () {
    this.loadData()
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.page !== this.state.page ||
        prevState.pageSize !== this.state.pageSize ||
        prevState.search !== this.state.search) {
      this.loadData()
    }
  }

  loadData () {
    const {page, pageSize, search} = this.state
    const sep = this.props.url.indexOf('?') > -1 ? '&' : '?'
    const url = `${this.props.url}${sep}${buildQueryString({page, pageSize, search})}`

    return getData(url)
      .then((response) => {
        this.setState({
          list: response,
          isLoading: false,
          isRefreshing: false,
          error: null
        })
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
          isRefreshing: false,
          error
        })
      })
  }

  render () {
    if (this.state.isLoading) {
      return <LoadingSpinner />
    }
    if (this.state.error) {
      return <FetchErrorAlert error={this.state.error} />
    }

    const position = this.props.position || 'bottom'
    const {count, results} = this.state.list
    const ListComponent = this.props.listComponent

    return (
      <div data-qa='data-loaded'>
        { this.state.isRefreshing && <RefreshSpinner /> }

        { (position === 'top') && this.renderPaginationBar() }

        { count === 0 && this.renderEmptyWarning() }

        { count > 0 &&
          <ListComponent
            {...this.props.extras}
            list={results}
            total={count}
            start={this.state.pageSize * (this.state.page - 1) + 1}
          />
        }

        { (position === 'bottom') && this.renderPaginationBar() }
      </div>
    )
  }

  renderEmptyWarning () {
    if (!this.state.isRefreshing && this.state.search) {
      return (
        <div data-qa='data-empty' className='container-fluid'>
          <p className='alert alert-danger'>
            <i className='fas fa-exclamation-triangle mr-2' />
            <FormattedMessage
              id='pagination.search.empty'
              defaultMessage='No results found for {search}.'
              values={{ search: this.state.search }}
            />
          </p>
        </div>
      )
    }

    return <EmptyAlert />
  }

  renderPaginationBar () {
    return (
      <PaginationBar
        currentPage={this.state.page}
        pageSize={this.state.pageSize}
        records={(this.state.list && this.state.list.count) || 0}

        goToPage={(page) => { this.setState({ page, isRefreshing: true }) }}
        onSearch={(search) => { this.setState({ search, page: 1, isRefreshing: true }) }}

        search={this.props.search}
        showFirst={this.props.showFirst}
        showPrevious={this.props.showPrevious}
        showNext={this.props.showNext}
        showLast={this.props.showLast}
      />
    )
  }
}
