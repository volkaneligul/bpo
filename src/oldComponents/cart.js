/**
 * Sepet
 */
(function(ko, $, HB, undefined) {
    'use strict';

    var opts = {};
    var customizedItemValidation,
        updateXhr = null,
        cartData = {};

    var selectors = {
        btnUseGiftCert: '.bt-use-gift-cert',
        giftCertCode: '.gift-cert-code',
        usedCertContainer: '#used-gift-cert-container',
        productContaier: '.product-container',
        container: 'div.container',
        cartContainer: '#content',
        customizedMessage: '.customized-message',
        frmCustomizedItem: 'form#form-item-list',
        criticalMessage: '#critical-message'
    };

    var paths = {
        GET_CART: '/Cart/GetCart',
        GET_VIEW: '/Cart/Index',
        ADD_STOCK_ALERT: '/Cart/AddStockAlert',
        DELETE_ITEM: '/Cart/DeleteCartItem',
        UPDATE_QUANTITY: '/Cart/ChangeCartItemQuantity',
        UPDATE_SERVICE: '/Cart/ToggleInsuranceItem',
        SET_CUSTOMIZED_MESSAGE: '/Cart/SetCustomizedProductValues',
        ADD_TO_LIST: '/Cart/AddMyList',
        CONTINUE_CHECKOUT: '/Cart/ContinueCheckout'
    };

    var messages = {
        commonError: 'Hata meydana geldi. Lütfen tekrar deneyiniz.',
        confirmDelete: 'Ürünü silmek istediğinize emin misiniz?',
        removeError: 'Silme işlemi sırasında bir hata oluştu. Tekrar deneyin',
        addedToList: 'Ürün başarıyla favori listenize taşındı.',
        cannotAdd: 'Ürün eklenemedi. Lütfen tekrar deneyin.',
        customizedItemError: 'İsme özel ürün mesajı kaydedilemedi. Lütfen tekrar deneyin',
        updateError: 'Güncelleme sırasında bir hata oluştu. Tekrar deneyin',
        loadError: 'Hata meydana geldi. Lütfen sayfayı yenileyin.',
        cartNotLoaded: 'Sepetinizdeki ürünler geçici olarak görüntülenememektedir. Lütfen kısa bir süre sonra tekrar deneyiniz.'
    };

    var constants = {
        MAX_QUANTITY: 999
    };

    var CartService = function() {
        var removeItem = function(params, beforeSend, url) {
            url = url || HB.SITE_URL + paths.DELETE_ITEM;

            return $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: params,
                beforeSend: beforeSend
            });
        };

        var updateItem = function(params, beforeSend, url) {
            url = url || HB.SITE_URL + paths.UPDATE_QUANTITY;

            return $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: params,
                beforeSend: beforeSend
            });
        };

        var addToList = function(params, beforeSend, url) {
            url = url || HB.SITE_URL + paths.ADD_TO_LIST;

            return $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: params,
                beforeSend: beforeSend
            });
        };

        var setCustomizeMessages = function(customizedItems, beforeSend, url) {
            url = url || HB.SITE_URL + paths.SET_CUSTOMIZED_MESSAGE;

            return $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: customizedItems,
                beforeSend: beforeSend
            });
        };

        var proceed = function(params, beforeSend, url) {
            url = url || HB.SITE_URL + paths.CONTINUE_CHECKOUT;

            return $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                data: params,
                beforeSend: beforeSend
            });
        };

        return {
            removeItem: removeItem,
            updateItem: updateItem,
            addToList: addToList,
            setCustomizeMessages: setCustomizeMessages,
            proceed: proceed
        };
    };

    /**
     * Urun modeli
     * @param  {object} item Urun verisi
     */
    var CartItem = function(item) {
        var id = ko.observable(item.id);
        var productName = ko.observable(item.productName);
        var hasMerchant = ko.observable(item.typeCode === 4);
        var hasMontageMessage = ko.observable(item.typeCode === 7 ||
            item.typeCode === 6);
        var isAddToListAvailable = ko.observable(HB.stringToBoolean(
            item.detail.properties.addToListAvailable));
        var merchantName = ko.observable(hasMerchant() ?
            item.detail.properties.merchantName :
            'Hepsiburada');
        var merchantUrl = ko.observable(item.detail.properties.merchantUrl);
        var productImageUrl = ko.observable(item.productImageUrl);
        var quantity = ko.observable(item.quantity).extend({
            range: {
                min: 0,
                max: 999
            }
        });
        var price = ko.observable(item.price);
        var oldPrice = ko.observable(item.detail.prices.priceWithoutDiscount);
        var inStockDate = ko.observable(item.detail.properties.inStockDate);
        var quantityFixed = ko.observable(item.quantityFixed);
        var sku = ko.observable(item.sku);
        var catalogName = ko.observable(item.catalogName);
        var productOid = ko.observable(item.detail.properties.productOid);
        var isCustomizedProduct = ko.observable(item.isCustomizedProduct);
        var isGiftProduct = ko.observable(item.isAddedBySystem);

        /**
         * Either from item itself or
         * from cargo free campaigns
         * @type {Boolean}
         */
        var isFreeShipping = ko.observable(HB.stringToBoolean(
            item.detail.properties.freeShipment) || item.detail.properties.freeShippingCampaignIdList);

        var isFastShipping = ko.observable(HB.stringToBoolean(
            item.detail.properties.fastShipping));
        var isDiscountWarningVisible = ko.observable(HB.stringToBoolean(
            item.isDiscountWarningVisible));
        var remainingDaysForDiscount = ko.observable(
            item.remainingDaysForDiscount);
        var productAtDiscount = ko.observable(HB.stringToBoolean(
            item.detail.properties.productAtDiscount));
        var hasLimitedStock = ko.observable(HB.stringToBoolean(
            item.detail.properties.isLimitedStock));
        var awardInfo = ko.observableArray($.parseJSON(
            item.detail.properties.itemCampAwardInfoList));
        var umbrellaInfo = ko.observableArray($.parseJSON(
            item.detail.properties.itemCandidateFreeShippingCampAwardInfoList));
        var estimatedTime = ko.observable(
            item.detail.properties.estimatedShippingValueCart);
        var isReadOnly = ko.observable(item.readOnly);
        var isLoading = ko.observable(false);

        /**
         * Montaj mesajı varsa degerini yazar
         * (CS-2990, CS-2870)
         */
        var montageMessage = ko.computed(function() {
            return hasMontageMessage() ? item.detail.properties.relatedCartItemMontageMessage : null;
        });

        /**
         * Customized veya Partner Product ve MP ürünü değilse alisveris listesine ekle islemi yapilabilir
         * isAddToListAvailable for warranty and montage (CS-2990, CS-2870)
         */
        var addToListAvailable = ko.computed(function() {
            return !item.isCustomizedProduct &&
                item.typeCode !== 2 &&
                item.typeCode !== 4 &&
                isAddToListAvailable();
        });

        var itemUrl = ko.computed(function() {
            return item.partnerProduct.previewUrl ?
                item.partnerProduct.previewUrl :
                item.productPageUrl;
        });

        var remainingDay = ko.computed(function() {
            if (isDiscountWarningVisible()) {

                if (remainingDaysForDiscount() > 0) {
                    return 'İndirimin bitmesine ' + remainingDaysForDiscount() + ' gün kaldı';
                } else {
                    return 'İndirim bugün sona eriyor!';
                }
            } else {
                return '';
            }
        });

        /**
         * Ön siparişli ürün
         * @return {boolean}
         */
        var isAdvanceOrder = ko.computed(function() {
            return inStockDate() !== '';
        });

        /**
         * Adet degisimi isareti
         * @type {ko.ChangedFlag}
         */
        var quantityChangedFlag = new ko.ChangedFlag(quantity);
        var isQuantityChanged = ko.computed(function() {
            return !isLoading() && quantityChangedFlag.isChanged();
        });

        var quantityZero = ko.computed(function() {
            return quantity() === 0;
        });

        var hasShippingPrice = ko.computed(function() {
            return !isFreeShipping() && !isGiftProduct() && !hasMontageMessage();
        });

        var obj = {
            id: id,
            productName: productName,
            hasMerchant: hasMerchant,
            merchantName: merchantName,
            merchantUrl: merchantUrl,
            montageMessage: montageMessage,
            productImageUrl: productImageUrl,
            quantity: quantity,
            price: price,
            oldPrice: oldPrice,
            inStockDate: inStockDate,
            quantityFixed: quantityFixed,
            sku: sku,
            catalogName: catalogName,
            productOid: productOid,
            isCustomizedProduct: isCustomizedProduct,
            isGiftProduct: isGiftProduct,
            isFreeShipping: isFreeShipping,
            isFastShipping: isFastShipping,
            isDiscountWarningVisible: isDiscountWarningVisible,
            remainingDaysForDiscount: remainingDaysForDiscount,
            productAtDiscount: productAtDiscount,
            hasLimitedStock: hasLimitedStock,
            awardInfo: awardInfo,
            umbrellaInfo: umbrellaInfo,
            isReadOnly: isReadOnly,
            isLoading: isLoading,
            addToListAvailable: addToListAvailable,
            itemUrl: itemUrl,
            estimatedTime: estimatedTime,
            remainingDay: remainingDay,
            isAdvanceOrder: isAdvanceOrder,
            isQuantityChanged: isQuantityChanged,
            quantityZero: quantityZero,
            hasShippingPrice: hasShippingPrice
        };

        /**
         * İsme özel ürün
         */
        if (isCustomizedProduct()) {
            obj.customizedMessage = ko.observable(item.customizedProductValue);
            obj.customizedMessageLength = ko.observable(
                item.customizedProductProperties.length);
            obj.customizedItemDescription = ko.observable(
                item.customizedProductProperties.description);
            obj.customizedItemDisplayName = ko.observable(
                item.customizedProductProperties.displayName);
        }

        return obj;
    };

    /**
     * Mapping
     * Sunucudan gelen data burada islenip daha sonra "map" edilir
     */
    var dataMappingOptions = {

        /**
         * Sepet detayı
         */
        detail: {
            update: function(options) {
                options.parent.umbrellaCounter(options.data.properties.counterForCandidateFreeShippingCampaign ?
                    options.data.properties.counterForCandidateFreeShippingCampaign + ' TL' : null);

                options.parent.umbrellaCampaignName(options.data.properties.campaignNameForCandidateFreeShippingCampaign ?
                    '"' + options.data.properties.campaignNameForCandidateFreeShippingCampaign + '"' : null);

                options.parent.umbrellaVignette(options.data.properties.vignetteUrlForCandidateFreeShippingCampaign ? options.data.properties.vignetteUrlForCandidateFreeShippingCampaign : null);

                return options;
            }
        },

        /**
         * Urun listesi
         */
        itemList: {
            create: function(options) {
                options.data.price = HB.pointReplace(options.data.price) === '0.00' ?
                    'Bedava' :
                    options.data.price + ' TL';

                options.data.productName = options.data.detail.properties.name;

                if (options.data.detail.properties.variantOption !== '') {
                    options.data.productName = options.data.detail.properties.name +
                        ' (' + options.data.detail.properties.variantOption + ')';
                }

                if (options.data.isCustomizedProduct) {
                    options.parent.hasCustomizedItem(true);
                }

                /* Hediye olmayan urun icin isAddedBySystem true donuyor
                 * fiyat kontrolu de yapılarak manuel olarak false set edildi.
                 */

                if (options.data.price !== 'Bedava' && options.data.isAddedBySystem) {
                    options.data.isAddedBySystem = false;
                }

                return new CartItem(options.data);
            }
        }
    };

    /**
     * Sepet ViewModel
     * @param {object} data Sepet verileri
     */
    var Cart = function(data) {
        var self = this;

        HB.BaseViewModel.call(self, data);

        self.isLoading = ko.observable(false);
        self.hasCustomizedItem = ko.observable(false);
        self.customizedItems = ko.observableArray([]);
        self.service = new CartService();

        self.umbrellaVignette = ko.observable(null);
        self.umbrellaCounter = ko.observable(null);
        self.umbrellaCampaignName = ko.observable(null);

        ko.mapping.fromJS(data, dataMappingOptions, self);

        /**
         * Black Friday
         * Kargo ücreti konfigurasyonu
         */
        self.shippingCalculationEnabledForGetCart = ko.observable(opts.shippingCalculationEnabledForGetCart);

        /**
         * Lastik montajı seçilebilir ve ilk değer null
         * olarak gelirse true'a set eder
         * @type {Boolean}
         */
        self.isMontageSelected(data.isMontageAvailable &&
            data.isMontageSelected === null ||
            data.isMontageSelected === true ?
            true :
            false);

        /**
         * Sepet bos mu degeri "Sepetinizde urun bulunmamaktir"
         * uyarisi icin ayri olarak tutulmali
         */
        self.isCartEmpty = ko.computed(function() {
            return self.itemList().length === 0;
        });

        self.isMontageAndContinueAvailable = ko.computed(function() {
            return self.isMontageAvailable() && !self.blockContinue();
        });

        /**
         * Sepet verilerinin yeniden alinmasi oncesinde verileri resetler
         */
        self.resetValues = function() {
            self.hasCustomizedItem(false);
        };

        /**
         * Hediye ceklerini goster
         */
        self.showGiftCerts = function() {
            HB.GiftCertLightbox.showGiftCerts(self, getCart);
        };

        /**
         * Hediye cekini kaldir
         */
        self.removeGiftCert = function() {
            HB.GiftCertLightbox.removeGiftCert(self, getCart);
        };

        self.customizedProductForm = function() {
            return $(selectors.frmCustomizedItem);
        };

        self.increase = function(item) {
            if (item.quantityFixed()) {
                return;
            }

            var quantity = item.quantity();

            if (quantity < constants.MAX_QUANTITY) {
                item.quantity(quantity + 1);
                self.update(item);

                return item;
            } else {
                return false;
            }
        };

        self.decrease = function(item) {
            if (item.quantityFixed()) {
                return;
            }

            var quantity = item.quantity();
            item.quantity(quantity - 1);

            if (quantity > 1) {
                self.update(item);
            } else if (window.confirm(messages.confirmDelete)) {
                self.remove(item);
            }

            return item;
        };

        self.update = function(item) {
            if (updateXhr !== null) {
                updateXhr.abort();
            }

            var updateParams = {
                id: item.id(),
                quantity: item.quantity() === '' ? 0 : HB.int(item.quantity())
            };

            updateXhr = self.service.updateItem(updateParams, function() {
                HB.App.blockUI();
                HB.App.errorMessage(HB.errorContainerStr, false);
                item.isLoading(true);
            }).done(function(response) {

                $.responseControl({
                    data: response,
                    success: function() {
                        updateCart(self, response);
                    },
                    error: function() {
                        HB.App.errorMessage(HB.errorContainerStr, true, messages.updateError);
                    }
                });
            }).fail(function() {
                HB.App.errorMessage(HB.errorContainerStr, true, messages.commonError);
            }).always(function() {
                HB.App.unblockUI();
                item.isLoading(false);
            });

            return updateParams;
        };

        self.remove = function(item) {

            var removeParams = {
                cartItemId: item.id(),
                cartId: self.id()
            };

            self.service.removeItem(removeParams, function() {
                HB.App.blockUI();
                HB.App.errorMessage(HB.errorContainerStr, false);
            }).then(function(response) {
                $.responseControl({
                    data: response,
                    success: function() {
                        updateCart(self, response);
                    },
                    error: function() {
                        HB.App.errorMessage(HB.errorContainerStr, true, messages.removeError);
                    }
                });
            }).fail(function() {
                HB.App.errorMessage(HB.errorContainerStr, true, messages.commonError);
            }).always(function() {
                HB.App.unblockUI();
            });

            return removeParams;
        };

        self.addToList = function(item) {
            if (item.addToListAvailable()) {
                var requestData = {
                    sku: item.sku(),
                    catalogName: item.catalogName(),
                    productOid: item.productOid()
                };

                self.service.addToList(requestData, function() {
                    HB.App.blockUI();
                    HB.App.errorMessage(HB.errorContainerStr, false);
                }).done(function(response) {

                    $.responseControl({
                        data: response,
                        success: function() {
                            updateCart(self, response);
                            HB.App.errorMessage(HB.errorContainerStr, true, messages.addedToList, true);
                        },
                        error: function() {
                            HB.App.errorMessage(HB.errorContainerStr, true, messages.cannotAdd);
                        }
                    });
                }).fail(function() {
                    HB.App.errorMessage(HB.errorContainerStr, true, messages.commonError);
                }).always(function() {
                    HB.App.unblockUI();
                });

                return requestData;
            } else {
                return false;
            }
        };

        self.bindings = function() {
            HB.App.handleTooltips();

            if (self.hasCustomizedItem()) {
                customizedItemValidation = HB.App.validation({
                    formId: self.customizedProductForm()
                });
            }

            runStickyBar();

            //CS-1884 Sidebar binding sırasında render olamadigi icin bu alanda kullanılan tooltip lerin calismasi
            setTimeout(function() {
                HB.App.handleTooltips();
            }, 10);
        };
    };

    Cart.prototype.setCustomizeMessages = function() {
        var self = this;

        if (!self.hasCustomizedItem()) {
            return false;
        }

        self.customizedItems($.map(ko.toJS(self.itemList()), function(item) {
            if (item.isCustomizedProduct) {
                return {
                    cartItemId: item.id,
                    customizedProductValue: item.customizedMessage
                };
            }
        }));

        var itemsToJson = HB.toJson({
            customizedItems: self.customizedItems()
        });

        self.service.setCustomizeMessages(itemsToJson, function() {
            HB.App.blockUI();
            HB.App.errorMessage(HB.errorContainerStr, false);
        }).done(function(response) {

            $.responseControl({
                data: response,
                success: function() {
                    self.proceed();
                },
                error: function() {
                    var message = messages.customizedItemError;

                    if (response.exceptionMessageList.length > 0) {
                        message = response.exceptionMessageList;
                    }

                    HB.App.errorMessage(HB.errorContainerStr, true, message);
                }
            });
        }).fail(function() {
            HB.App.errorMessage(HB.errorContainerStr, true, messages.commonError);
        }).always(function() {
            HB.App.unblockUI();
        });

        return self.customizedItems();
    };

    Cart.prototype.validateCustomizeMessages = function() {
        var customizedProductForm = this.customizedProductForm();

        if (customizedProductForm.valid()) {
            this.setCustomizeMessages();

            return true;
        } else {
            customizedItemValidation.focusInvalid();

            return false;
        }
    };

    Cart.prototype.continueWithMontage = function() {
        this.isMontageSelected(true);
        this.continueCheckout();
    };

    Cart.prototype.continueCheckout = function() {
        if (this.hasCustomizedItem()) {
            this.validateCustomizeMessages();

            return false;
        } else {
            this.proceed();

            return true;
        }
    };

    /**
     * Hediye paketi eklenme durumuna gore farkli adreslere yonlendirir
     */
    Cart.prototype.proceed = function() {
        var self = this;
        var isGiftBoxSelected = self.isGiftBoxOptionRestricted() ?
            false :
            self.isGiftBoxSelected();
        var isMontageSelected = null;

        /**
         * Sepetteki montaj ürününe göre seçim gönderimi
         */
        if (self.isMontageAvailable()) {
            isMontageSelected = self.isMontageSelected();
        } else {

            /**
             * Montaj servisi alınamıyorsa ve montaj seçili geliyorsa
             * seçimi kaldır
             */
            if (self.isMontageSelected()) {
                isMontageSelected = false;

                /**
                 * Sepette montajla ilgili hiç işlem yapılmadığı durum
                 */
            } else {
                isMontageSelected = null;
            }
        }

        self.service.proceed({
            giftBoxSelected: isGiftBoxSelected,
            isMontageSelected: isMontageSelected
        }, function() {
            HB.App.blockUI();
            HB.App.errorMessage(HB.errorContainerStr, false);
        }).done(function(response) {

            $.responseControl({
                data: response,
                success: function() {
                    HB.router(response.redirectionKey);
                },
                error: function() {
                    HB.App.errorMessage(HB.errorContainerStr, true, response.exceptionMessageList);
                }
            });
        }).fail(function() {
            HB.App.errorMessage(HB.errorContainerStr, true, messages.commonError);
        }).always(function() {
            HB.App.unblockUI();
        });

        return {
            proceed: true,
            isGiftBoxSelected: isGiftBoxSelected,
            isMontageSelected: isMontageSelected
        };
    };

    /**
     * KO Bindings
     */
    var bindings = function() {
        ko.applyBindings(new Cart(cartData), $(selectors.cartContainer).get(0));
    };

    var controlRecommendation = function(itemList) {

        if (opts.rA) {
            HB.controlRecommendationEngines(itemList, opts.isVisilabsEncapsulated, opts.visilabsSuggestionType);
        }
    };

    var controlRRProductsCart = function(itemList) {

        if ((!itemList.length && opts.isEmptyCartRecommendation) ||
            (itemList.length && opts.isNotEmptyCartRecommendation)) {
            HB.RunRecommendedProductsCart(itemList.length);
        }
    };

    /**
     * Sepeti guncelle
     * @param  {constructor} viewModel Sepet viewModel'i alir
     * @param  {object} response Sunucudan donen
     */
    var updateCart = function(viewModel, response) {

        $.responseControl({
            data: response,
            success: function() {

                /**
                 * Sepet bilgilerini KO observable'lara atar
                 */
                viewModel.resetValues();
                ko.mapping.fromJS(response, dataMappingOptions, viewModel);
                HB.App.handleTooltips();

                runStickyBar();

                /**
                 * recommended-products.js dosyasından çağırılır
                 * 
                 */
                //controlRecommendation(response.itemList);

                /**
                 * recommended-products-cart.js dosyasından çağırılır
                 * sepetteki en son urun silindiginde bos sepet onermesi icin calisir
                 * ya da urun silindiğinde yeni onerme icin calisir
                 */
                if (opts.isCartRecommendationAvailable) {
                    controlRRProductsCart(response.itemList);
                }
            },
            error: function() {
                HB.App.errorMessage(HB.errorContainerStr, true, messages.loadError);
            }
        });
    };

    /**
     * Sepetteki urunleri getirir
     */
    var getCart = function(cartViewModel, callback) {
        $.ajax({
            url: HB.SITE_URL + paths.GET_CART,
            type: 'POST',
            dataType: 'json',
            beforeSend: function() {
                HB.App.startProgress();
                HB.App.errorMessage(HB.errorContainerStr, false);
            },
            success: function(response) {
                HB.App.unblockUI();
                $.responseControl({
                    data: response,
                    success: function() {
                        cartData = response;

                        if (cartViewModel !== undefined) {
                            cartViewModel.resetValues();
                            ko.mapping.fromJS(cartData, dataMappingOptions, cartViewModel);
                            HB.App.handleTooltips();
                        }

                        if (typeof callback === 'function') {
                            callback();

                            /**
                             * recommended-products-cart.js dosyasından çağırılır
                             * toogle kontrollerine baglı olarak calisir
                             */
                            if (opts.isCartRecommendationAvailable && cartViewModel === undefined) {
                                controlRRProductsCart(response.itemList);
                            }
                        }

                        // recommended-products.js
                        //controlRecommendation(response.itemList);
                    },
                    error: function() {
                        HB.App.criticalMessage(selectors.criticalMessage, messages.cartNotLoaded);
                    }
                });
            },
            error: function() {
                HB.App.criticalMessage(selectors.criticalMessage, messages.cartNotLoaded);
            },
            complete: function() {
                HB.App.doneProgress();
            }
        });
    };

    HB.getCart = function(settings) {
        opts = $.extend({}, settings);
        opts.rA = opts.rA || HB.App.getURLParameter('run') !== null;

        getCart(undefined, bindings);
    };

    var runStickyBar = function() {
        if (opts.isStickySidebar) {
            $(".short-summary").stickySidebar({
                headerSelector: '.header-wrapper',
                footerSelector: '.footer-global',
                footerThreshold: 70
            });
        }
    };

    /**
     * Sepeti kod bloğu dışından çağırmak için kullanılır
     */
    HB.getUpdatedCart = function() {
        ko.cleanNode($(selectors.cartContainer).get(0));
        HB.getCart(opts);
    };

    HB.Cart = Cart;
}(ko, jQuery, HB));
