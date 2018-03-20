import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

import { filterByPaths } from '../utils/types'
import {
  JSONViewer,
  FullDateTime,
  LinksList,
  normalizeLinksList
} from '../components'

export default class SubmissionItem extends Component {
  render () {
    const {list} = this.props

    if (list.length !== 1) {
      return <div />
    }

    // assumption: there is only one item
    const submission = list[0]
    const {columns, separator} = this.props
    const links = normalizeLinksList(submission.attachments)

    return (
      <div data-qa={`submission-item-${submission.id}`} className='x-2'>
        <div className='survey-content single'>
          <div className='property'>
            <h5 className='property-title'>
              <FormattedMessage
                id='submission.view.date'
                defaultMessage='Submitted' />
            </h5>
            <div className='property-value'>
              <FullDateTime date={submission.date} />
            </div>
          </div>

          <div className='property'>
            <h5 className='property-title'>
              <FormattedMessage
                id='submission.view.revision'
                defaultMessage='Revision' />
            </h5>
            <div className='property-value'>
              {submission.revision}
            </div>
          </div>
          <div className='property'>
            <h5 className='property-title'>
              <FormattedMessage
                id='submission.view.survey.revision'
                defaultMessage='Survey Revision' />
            </h5>
            <div className='property-value'>
              {submission.map_revision}
            </div>
          </div>

          { submission.attachments.length > 0 &&
            <div className='property'>
              <h5 className='property-title'>
                <FormattedMessage
                  id='submission.view.attachments'
                  defaultMessage='Attachments' />
              </h5>
              <div className='property-value'>
                <LinksList list={links} />
              </div>
            </div>
          }

          <div>
            <JSONViewer
              data={filterByPaths(submission.payload, columns, separator)}
              links={links}
            />
          </div>
        </div>
      </div>
    )
  }
}
