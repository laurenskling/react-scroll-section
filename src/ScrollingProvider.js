import React from 'react';
import debounce from 'debounce';
import PropTypes from 'prop-types';
import { Provider } from './scrollContext';

export default class ScrollingProvider extends React.Component {
  static propTypes = {
    debounceDelay: PropTypes.number,
    scrollBehavior: PropTypes.oneOf(['auto', 'smooth']),
    children: PropTypes.node,
  };

  static defaultProps = {
    debounceDelay: 50,
    scrollBehavior: 'smooth',
    children: null,
  };

  state = {
    selected: '',
  };

  refList = {};

  componentDidMount() {
    document.addEventListener('scroll', this.debounceScroll, true);
    this.handleScroll();
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.debounceScroll, true);
  }

  handleScroll = () => {
    const selected = Object.entries(this.refList).reduce(
      (acc, [key, value]) => {
        const { top } = value.current.getBoundingClientRect();
        const differenceFromTop = Math.abs(top);

        return differenceFromTop < acc.differenceFromTop
          ? {
              differenceFromTop,
              key,
            }
          : acc;
      },
      {
        differenceFromTop: 9999,
        key: '',
      },
    );

    this.setState({ selected: selected.key });
  };

  // eslint-disable-next-line
  debounceScroll = debounce(this.handleScroll, this.props.debounceDelay || 50);

  registerRef = id => {
    const newRef = React.createRef();
    this.refList = { ...this.refList, [id]: newRef };
    return newRef;
  };

  scrollTo = section => {
    // const myDomNode = ReactDOM.findDOMNode(this.refList[section].current);
    const { scrollBehavior: behavior } = this.props;
    const myDomNode = this.refList[section].current;

    this.setState({ selected: section }, () =>
      window.scrollTo({
        top: myDomNode.offsetTop,
        behavior,
      }),
    );
  };

  render() {
    const { selected } = this.state;
    const { children } = this.props;
    const value = {
      registerRef: this.registerRef,
      scrollTo: this.scrollTo,
      selected,
    };
    return <Provider value={value}>{children}</Provider>;
  }
}
