import React from 'react';
import PropTypes from 'prop-types';
import {QueryRenderer, graphql} from 'react-relay';

import {autobind} from '../helpers';
import {SearchPropType, RemotePropType, BranchSetPropType} from '../prop-types';
import IssueishListController, {BareIssueishListController} from '../controllers/issueish-list-controller';
import RelayNetworkLayerManager from '../relay-network-layer-manager';

export default class IssueishListContainer extends React.Component {
  static propTypes = {
    token: PropTypes.string.isRequired,
    host: PropTypes.string.isRequired,
    limit: PropTypes.number,

    repository: PropTypes.shape({
      defaultBranchRef: PropTypes.shape({
        prefix: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      }),
    }),

    search: SearchPropType.isRequired,
    remote: RemotePropType.isRequired,
    branches: BranchSetPropType.isRequired,
    aheadCount: PropTypes.number,
    pushInProgress: PropTypes.bool.isRequired,

    onOpenIssueish: PropTypes.func.isRequired,
    onOpenSearch: PropTypes.func.isRequired,
    onCreatePr: PropTypes.func.isRequired,
  }

  static defaultProps = {
    limit: 20,
  }

  constructor(props) {
    super(props);

    autobind(this, 'renderQueryResult');
  }

  render() {
    const environment = RelayNetworkLayerManager.getEnvironmentForHost(this.props.host, this.props.token);

    if (this.props.search.isNull()) {
      return (
        <BareIssueishListController
          repository={this.props.repository}

          search={this.props.search}
          remote={this.props.remote}
          branches={this.props.branches}
          aheadCount={this.props.aheadCount}
          pushInProgress={this.props.pushInProgress}
          isLoading={false}

          onOpenIssueish={this.props.onOpenIssueish}
          onOpenSearch={this.props.onOpenSearch}
          onCreatePr={this.props.onCreatePr}
        />
      );
    }

    const query = graphql`
      query issueishListContainerQuery($query: String!, $first: Int!) {
        search(first: $first, query: $query, type: ISSUE) {
          ...issueishListController_results
        }
      }
    `;
    const variables = {
      query: this.props.search.createQuery(),
      first: this.props.limit,
    };

    return (
      <QueryRenderer
        environment={environment}
        variables={variables}
        query={query}
        render={this.renderQueryResult}
      />
    );
  }

  renderQueryResult({error, props}) {
    if (error) {
      return null;
    }

    if (props === null) {
      return (
        <BareIssueishListController
          repository={this.props.repository}

          search={this.props.search}
          remote={this.props.remote}
          branches={this.props.branches}
          aheadCount={this.props.aheadCount}
          pushInProgress={this.props.pushInProgress}
          isLoading={true}

          onOpenIssueish={this.props.onOpenIssueish}
          onOpenSearch={this.props.onOpenSearch}
          onCreatePr={this.props.onCreatePr}
        />
      );
    }

    return (
      <IssueishListController
        results={props.search}
        repository={this.props.repository}

        search={this.props.search}
        remote={this.props.remote}
        branches={this.props.branches}
        aheadCount={this.props.aheadCount}
        pushInProgress={this.props.pushInProgress}
        isLoading={false}

        onOpenIssueish={this.props.onOpenIssueish}
        onOpenSearch={this.props.onOpenSearch}
        onCreatePr={this.props.onCreatePr}
      />
    );
  }
}