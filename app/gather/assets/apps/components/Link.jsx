import React, { Component } from 'react'

import { AETHER_KERNEL_URL, AETHER_ODK_URL } from '../utils/env'

const getAppUrl = (app) => {
  switch (app) {
    case 'kernel':
      return AETHER_KERNEL_URL

    case 'odk':
      if (AETHER_ODK_URL) {
        return AETHER_ODK_URL
      }
      break
  }

  return ''
}

/**
 * Normalize a list of links with the complete url depending on the app
 *
 * @param {Array}  list  - a list of links (name, url).
 * @param {String} app   - app source: `kernel` (default), `odk` or `gather`
 */
export const normalizeLinksList = (list = [], app = 'kernel') => list
  .map(link => ({
    name: link.name,
    url: `${getAppUrl(app)}${link.url}`
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

/**
 * Link component.
 *
 * Renders a link.
 */
export class Link extends Component {
  render () {
    return (
      <a href={this.props.link.url} target='_blank'>
        { this.props.link.name }
      </a>
    )
  }
}

/**
 * LinksList component.
 *
 * Renders a collapsable list of links.
 */
export class LinksList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      collapsed: (props.list && props.list.length > 1)
    }
  }

  render () {
    const {list} = this.props

    if (!list || list.length === 0) {
      return ''
    }

    return (
      <div>
        { list.length > 1 &&
          <button
            className='btn icon-only btn-collapse'
            onClick={() => this.setState({ collapsed: !this.state.collapsed })}>
            <i className={`fa fa-${this.state.collapsed ? 'plus' : 'minus'}`} />
          </button>
        }

        { !this.state.collapsed &&
          <ol className='property-list'>
            {
              list.map((link, index) => (
                <li key={index} className='property-item'>
                  <Link link={link} />
                </li>
              ))
            }
          </ol>
        }
      </div>
    )
  }
}