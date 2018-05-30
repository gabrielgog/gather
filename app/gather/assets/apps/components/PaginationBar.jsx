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
 * software distributed under the License is distributed on anx
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { Component } from 'react'
import {
  defineMessages,
  injectIntl,
  FormattedMessage,
  FormattedNumber
} from 'react-intl'

const MESSAGES = defineMessages({
  first: {
    defaultMessage: 'First',
    id: 'pagination.first'
  },
  last: {
    defaultMessage: 'Last',
    id: 'pagination.last'
  },

  previous: {
    defaultMessage: 'Previous',
    id: 'pagination.previous'
  },
  next: {
    defaultMessage: 'Next',
    id: 'pagination.next'
  },

  search: {
    defaultMessage: 'Search…',
    id: 'pagination.search'
  },

  record: {
    defaultMessage: 'Record {current} of {total}',
    id: 'pagination.type.record'
  },
  page: {
    defaultMessage: 'Page {current} of {total}',
    id: 'pagination.type.page'
  }
})

/**
 * PaginationBar component.
 *
 * Renders the bar with:
 *  - the search input (optional),
 *  - the current page, an interactive input to go to the indicated page, and
 *  - the pagination buttons:
 *     - FIRST,
 *     - PREVIOUS,
 *     - NEXT and
 *     - LAST.
 */

class PaginationBar extends Component {
  constructor (props) {
    super(props)

    this.state = {
      currentPage: props.currentPage
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.currentPage !== this.state.currentPage) {
      this.setState({ currentPage: nextProps.currentPage })
    }
  }

  render (list) {
    if (this.getNumberOfPages() < 2 && !this.props.search) {
      return <div />
    }

    return (
      <nav data-qa='data-pagination' className='pagination-bar'>
        { /* render SEARCH */ }
        { this.renderSearchBar() }
        { /* render NAVIGATION BUTTONS and CURRENT PAGE input */ }
        { this.renderNavigationButtons() }
      </nav>
    )
  }

  getNumberOfPages () {
    return Math.ceil(this.props.records / this.props.pageSize) || 0
  }

  renderSearchBar () {
    if (!this.props.search) {
      return ''
    }

    const onChange = (event) => {
      this.setState({ [event.target.name]: event.target.value })
    }
    const onKeyPress = (event) => {
      if (event.charCode === 13) { // Enter
        this.props.onSearch(this.state.search)
        this.state.currentSearch = this.state.search
      }
    }
    const {formatMessage} = this.props.intl

    return (
      <div data-qa='data-pagination-search' className='search'>
        <input
          type='search'
          name='search'
          placeholder={formatMessage(MESSAGES.search)}
          value={this.state.search || ''}
          className={(this.state.search ? 'value' : '')}
          onChange={onChange}
          onKeyPress={onKeyPress}
        />
      </div>
    )
  }
  renderNavigationButtons () {
    if (this.getNumberOfPages() < 2) {
      return ''
    }

    return (
      <ul data-qa='data-pagination-buttons' className='pagination'>
        { /* go to FIRST page */}
        { this.renderLinkToPage('first') }

        { /* go to PREVIOUS page */}
        { this.renderLinkToPage('previous') }

        { /* CURRENT page */}
        <li className='page-item disabled'>
          <FormattedMessage
            {...MESSAGES[(this.props.pageSize === 1 ? 'record' : 'page')]}
            values={{
              current: this.renderCurrentPage(),
              total: this.renderNumberOfPages()
            }}
          />
        </li>

        { /* go to NEXT page */}
        { this.renderLinkToPage('next') }

        { /* go to LAST page */}
        { this.renderLinkToPage('last') }
      </ul>
    )
  }

  renderNumberOfPages () {
    return (
      <span data-qa='data-pagination-total'>
        <FormattedNumber value={this.getNumberOfPages()} />
      </span>
    )
  }

  renderCurrentPage () {
    const numberOfPages = this.getNumberOfPages()

    // indicates if the value in the input reflects the current page or
    // if it is still pending.
    // (only after losing the focus, `onBlur` event, will request a new page)
    const isPending = (this.state.currentPage !== this.props.currentPage)

    return (
      <span
        data-qa='data-pagination-page'
        className={`current-page ${isPending ? 'pending' : ''}`}>
        <input
          type='number'
          name='currentPage'
          value={this.state.currentPage}
          maxLength={Math.ceil(numberOfPages / 10) + 1}
          min={1}
          max={numberOfPages}
          onChange={this.onChangePage.bind(this)}
          onBlur={this.onBlurPage.bind(this)}
        />
      </span>
    )
  }

  onChangePage (event) {
    const numberOfPages = this.getNumberOfPages()
    const newPage = parseInt(event.target.value || 0, 10)

    if (newPage < 1) {
      this.setState({ currentPage: 1 })
    } else if (newPage > numberOfPages) {
      this.setState({ currentPage: numberOfPages })
    } else {
      this.setState({ currentPage: newPage })
    }
  }

  onBlurPage () {
    if (this.state.currentPage !== this.props.currentPage) {
      this.props.goToPage(this.state.currentPage)
    }
  }

  renderLinkToPage (pageName) {
    const {formatMessage} = this.props.intl
    const {currentPage} = this.props
    const numberOfPages = this.getNumberOfPages()
    let newPage = currentPage

    switch (pageName) {
      case 'first':
        // condition: show FIRST link and current PAGE > 1
        if (this.props.showFirst && currentPage > 1) {
          newPage = 1
        }
        break

      case 'previous':
        // condition: show NEXT link and current PAGE > 1
        // except: show FIRST and current PAGE = 2
        if (this.props.showPrevious && currentPage > 1 &&
          !(this.props.showFirst && currentPage === 2)) {
          newPage = currentPage - 1
        }
        break

      case 'next':
        // condition: show NEXT link and current PAGE < total PAGES
        // except: show LAST and current PAGE = total PAGES - 1
        if (this.props.showNext && currentPage < numberOfPages &&
          !(this.props.showLast && currentPage === numberOfPages - 1)) {
          newPage = currentPage + 1
        }
        break

      case 'last':
        // condition: show LAST link and current PAGE < total PAGES
        if (this.props.showLast && currentPage < numberOfPages) {
          newPage = numberOfPages
        }
        break
    }

    if (newPage === currentPage) {
      return ''
    }

    return (
      <li data-qa={`data-pagination-${pageName}`} className='page-item'>
        <button
          type='button'
          className='page-link'
          onClick={() => this.props.goToPage(newPage)}
          aria-label={formatMessage(MESSAGES[pageName])}>
          <FormattedMessage {...MESSAGES[pageName]} />
        </button>
      </li>
    )
  }
}

// Include this to enable `this.props.intl` for this component.
export default injectIntl(PaginationBar)
