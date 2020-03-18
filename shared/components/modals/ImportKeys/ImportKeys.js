import React, { Component } from 'react'

import actions from 'redux/actions'

import * as bitcoin from 'bitcoinjs-lib'

import Link from 'sw-valuelink'
import { btc, ltc, bch, constants, links } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './ImportKeys.scss'

import Group from './Group/Group'
import { Modal } from 'components/modal'
import { FieldLabel } from 'components/forms'
import { Button } from 'components/controls'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { localisedUrl } from 'helpers/locale'
import config from 'helpers/externalConfig'


const title = defineMessages({
  Import: {
    id: 'Import',
    defaultMessage: 'Import keys',
  },
})

@injectIntl
@cssModules(styles)
export default class ImportKeys extends Component {

  state = {
    ethKey: '',
    btcKey: '',
    bchKey: '',
    ltcKey: '',
    // xlmKey: '',

    isSubmittedEth: false,
    isSubmittedBtc: false,
    isSubmittedBch: false,
    isSubmittedLtc: false,
    // isSubmittedXlm: false,

    isImportedEth: false,
    isImportedBtc: false,
    isImportedBch: false,
    isImportedLtc: false,
    // isImportedXlm: false,

    isDisabled: true,
    keySave: false,
    onCloseLink: links.wallet,
  }

  componentWillMount() {
    const saveKeys = JSON.parse(localStorage.getItem(constants.localStorage.privateKeysSaved))

    if (saveKeys) {
      this.setState(() => ({ keySave: true }))
    }
  }

  componentDidMount() {
    this.checkAnyImport()
  }

  handleGoTo = (goToLink) => {
    const {
      intl: { locale },
    } = this.props

    window.location.hash = localisedUrl(locale, goToLink)
    window.location.reload()
  }

  handleEthImportKey = () => {
    let { ethKey } = this.state

    if (!ethKey || ethKey.length < 40) {
      this.setState({ isSubmittedEth: true })
      return
    }

    const withOx = ethKey.substring(0, 2)

    if (withOx !== '0x') {
      ethKey = `0x${ethKey}`
    }

    try {
      actions.eth.login(ethKey)
      this.setState({
        isImportedEth: true,
        isDisabled: false,
      })
      actions.core.markCoinAsVisible('ETH')
      this.setState({
        onCloseLink: links.EthWallet,
      })
    } catch (e) {
      this.setState({ isSubmittedEth: true })
    }
  }

  handleBtcImportKey = () => {
    const { btcKey } = this.state

    try {
      bitcoin.ECPair.fromWIF(btcKey, btc.network) // eslint-disable-line
    } catch (e) {
      this.setState({ isSubmittedBtc: true })
      return false
    }

    if (!btcKey || btcKey.length < 27) {
      this.setState({ isSubmittedBtc: true })
      return
    }

    try {
      actions.btc.login(btcKey)
      this.setState({
        isImportedBtc: true,
        isDisabled: false,
      })
      actions.core.markCoinAsVisible('BTC')
      this.setState({
        onCloseLink: links.BtcWallet,
      })
    } catch (e) {
      console.log(e)
      this.setState({ isSubmittedBtc: true })
    }
  }

  handleBchImportKey = () => {
    const { bchKey } = this.state

    try {
      bitcoin.ECPair.fromWIF(bchKey, bch.network) // eslint-disable-line
    } catch (e) {
      console.error(e)
      this.setState({ isSubmittedBch: true })
      return false
    }

    if (!bchKey || bchKey.length < 27) {
      this.setState({ isSubmittedBch: true })
      return
    }

    try {
      actions.bch.login(bchKey)
      this.setState({
        isImportedBch: true,
        isDisabled: false,
      })
      actions.core.markCoinAsVisible('BCH')
      this.setState({
        onCloseLink: links.BchWallet,
      })
    } catch (e) {
      console.error(e)
      this.setState({ isSubmittedBch: true })
    }
  }

  handleLtcImportKey = () => {
    const { ltcKey } = this.state

    try {
      bitcoin.ECPair.fromWIF(ltcKey, ltc.network) // eslint-disable-line
    } catch (e) {
      this.setState({ isSubmittedLtc: true })
      return false
    }

    if (!ltcKey || ltcKey.length < 27) {
      this.setState({ isSubmittedLtc: true })
      return
    }

    try {
      actions.ltc.login(ltcKey)
      this.setState({
        isImportedLtc: true,
        isDisabled: false,
      })
      actions.core.markCoinAsVisible('LTC')
      this.setState({
        onCloseLink: links.LtcWallet
      })
    } catch (e) {
      this.setState({ isSubmittedLtc: true })
    }
  }

  /*
  handleXlmImportKey = () => {
    const { xlmKey } = this.state

    if (!xlmKey) {
      this.setState({ isSubmittedXlm: true })
      return
    }

    try {
      actions.xlm.login(xlmKey)
      this.setState({
        isImportedXlm: true,
        isDisabled: false,
      })
    } catch (e) {
      this.setState({ isSubmittedXlm: true })
    }
  }
  */

  handleImportKeys = () => {
    this.handleCloseModal()
    localStorage.setItem(constants.localStorage.testnetSkipPKCheck, true)
    localStorage.setItem(constants.localStorage.isWalletCreate, true)

    setTimeout( () => {
      const { onCloseLink } = this.state
      const { isImportedBch, isImportedBtc, isImportedEth, isImportedLtc } = this.state

      if ( [isImportedBch, isImportedBtc, isImportedEth, isImportedLtc].filter(i => i).length > 1 ) {
        this.handleGoTo( links.home )
      } else {
        this.handleGoTo( onCloseLink )
      }
    }, 500 )
  }

  handleCloseModal = () => {
    const { name, data } = this.props

    actions.modals.close(name)
    if (typeof data.onClose === 'function') {
      data.onClose()
    }
  }

  checkAnyImport = () => {
    const { isSubmittedEth, isSubmittedBtc, isSubmittedBch, isSubmittedLtc /* , isSubmittedXlm */ } = this.state

    if (isSubmittedEth || isSubmittedBtc || isSubmittedBch || isSubmittedLtc /* || isSubmittedXlm */) {
      this.setState(() => ({ isDisabled: false }))
    }
  }

  render() {
    const {
      isSubmittedEth, isSubmittedBtc, isSubmittedBch, isSubmittedLtc, /* isSubmittedXlm, */
      isImportedEth, isImportedBtc, isImportedBch, isImportedLtc, /* isImportedXlm, */ isDisabled, keySave,
    } = this.state

    const { intl, data } = this.props

    const linked = Link.all(this, 'ethKey', 'btcKey', 'bchKey', 'ltcKey' /* , 'xlmKey' */)

    if (isSubmittedEth) {
      linked.ethKey.check((value) => value !== '', <FormattedMessage id="importkeys172" defaultMessage="Please enter ETH private key" />)
      linked.ethKey.check((value) => value.length > 40, <FormattedMessage id="importkeys173" defaultMessage="Please valid ETH private key" />)
    }

    if (isSubmittedBtc) {
      linked.btcKey.check((value) => value !== '', <FormattedMessage id="importkeys118" defaultMessage="Please enter BTC private key" />)
      linked.btcKey.check((value) => value.length > 27, <FormattedMessage id="importkeys119" defaultMessage="Please valid BTC private key" />)
      linked.btcKey.check(() =>
        this.handleBtcImportKey(), <FormattedMessage id="importkeys190" defaultMessage="Something went wrong. Check your private key, network of this address and etc." />)
    }

    if (isSubmittedBch) {
      linked.bchKey.check((value) => value !== '', <FormattedMessage id="importkeys239" defaultMessage="Please enter BCH private key" />)
      linked.bchKey.check((value) => value.length > 27, <FormattedMessage id="importkeys240" defaultMessage="Please valid BCH private key" />)
      linked.bchKey.check(() =>
        this.handleBchImportKey(), <FormattedMessage id="importkeys190" defaultMessage="Something went wrong. Check your private key, network of this address and etc." />)
    }

    if (isSubmittedLtc) {
      linked.ltcKey.check((value) => value !== '', <FormattedMessage id="importkeys200" defaultMessage="Please enter LTC private key" />)
      linked.ltcKey.check((value) => value.length > 27, <FormattedMessage id="importkeys201" defaultMessage="Please valid LTC private key" />)
      linked.ltcKey.check(() =>
        this.handleLtcImportKey(), <FormattedMessage id="importkeys190" defaultMessage="Something went wrong. Check your private key, network of this address and etc." />)
    }
    /*
    if (isSubmittedXlm) {
      linked.btcKey.check((value) => value !== '', <FormattedMessage id="importkeys187" defaultMessage="Please enter XLM private key" />)
    }
    */
    return (
      <Modal name={this.props.name} title={intl.formatMessage(title.Import)} data={data} onClose={this.state.onClose}>
        <div styleName="modal" className="ym-hide-content">
          <p>
            <FormattedMessage id="ImportKeys107" defaultMessage="This procedure will rewrite your private key. If you are not sure about it, we recommend to press cancel" />
          </p>
          {(!config.opts.curEnabled || config.opts.curEnabled.eth) && (
            <>
              <FieldLabel positionStatic>
                <FormattedMessage id="ImportKeys110" defaultMessage="Please enter ETH private key" />
              </FieldLabel>
              <Group
                inputLink={linked.ethKey}
                placeholder="Key"
                disabled={isImportedEth}
                onClick={this.handleEthImportKey}
              />
            </>
          )}
          {(!config.opts.curEnabled || config.opts.curEnabled.btc) && (
            <>
              <FieldLabel positionStatic>
                <FormattedMessage id="ImportKeys120" defaultMessage="Please enter BTC private key in WIF format" />
              </FieldLabel>
              <Group
                inputLink={linked.btcKey}
                placeholder="Key in WIF format"
                disabled={isImportedBtc}
                onClick={this.handleBtcImportKey}
              />
            </>
          )}
          {(!config.opts.curEnabled || config.opts.curEnabled.bch) && (
            <>
              <FieldLabel positionStatic>
                <FormattedMessage id="ImportKeys280" defaultMessage="Please enter BCH private key in WIF format" />
              </FieldLabel>
              <Group
                inputLink={linked.bchKey}
                placeholder="Key in WIF format"
                disabled={isImportedBch}
                onClick={this.handleBchImportKey}
              />
            </>
          )}
          {(!config.opts.curEnabled || config.opts.curEnabled.ltc) && (
            <>
              <FormattedMessage id="ImportKeys205" defaultMessage="Please enter LTC private key in WIF format">
                {message => <FieldLabel positionStatic>{message}</FieldLabel>}
              </FormattedMessage>
              <Group
                inputLink={linked.ltcKey}
                placeholder="Key in WIF format"
                disabled={isImportedLtc}
                onClick={this.handleLtcImportKey}
              />
            </>
          )}
          {
            /*
            <FormattedMessage id="ImportKeys176" defaultMessage="Please enter xlm private key">
              {message => <FieldLabel positionStatic>{message}</FieldLabel>}
            </FormattedMessage>
            <Group
              inputLink={linked.xlmKey}
              placeholder="Key"
              disabled={isImportedXlm}
              onClick={this.handleXlmImportKey}
            />
            */
          }
          {
            !keySave && (
              <span styleName="error">
                <FormattedMessage id="errorImportKeys" defaultMessage=" Please save your private keys" />
              </span>
            )
          }
          <Button brand disabled={isDisabled} styleName="button" onClick={this.handleImportKeys}>
            <FormattedMessage id="ImportKeys130" defaultMessage="Confirm" />
          </Button>
          <Button gray styleName="button" onClick={this.handleCloseModal}>
            <FormattedMessage id="ImportKeys133" defaultMessage="Cancel" />
          </Button>
        </div>
      </Modal>
    )
  }
}
