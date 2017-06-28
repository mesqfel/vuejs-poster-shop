var PRICES = [39.99, 29.99, 19.99, 9.99, 0.99];
var LOAD_NUM = 10;

new Vue({
	el: '#app',
	data: {
		total: 0,
		items: [],
		results: [],
		cart: [],
		search: 'surf',
		lastSearch: '',
		noResults: false,
		loading: false
	},
	computed: {
		noMoreItems: function(){
			return (this.items.length == this.results.length) && !this.loading;
		}
	},
	methods: {
		addItem: function(index){
			
			var item = this.items[index];
			var found = false;

			this.total += this.items[index].price;

			for(var i=0; i < this.cart.length; i++){

				if(this.cart[i].id == item.id){
					this.cart[i].qty++;
					found = true;
					break;
				}

			}

			if(!found){
				this.cart.push({
					id: item.id,
					title: item.title,
					price: item.price,
					qty: 1
				});
			}

		},
		inc: function(item){
			item.qty++;
			this.total += item.price;
		},
		dec: function(item){
			item.qty--;
			this.total -= item.price;

			if(item.qty <= 0){
				for(var i=0; i < this.cart.length; i++){
					if(this.cart[i].id == item.id){
						this.cart.splice(i, 1);
						break;
					}
				}
			}
		},
		appendItems: function(){

			if(this.items.length < this.results.length){
				var append = this.results.slice(this.items.length, this.items.length+LOAD_NUM);
				this.items = this.items.concat(append);
			}

		},
		onSubmitSearch: function(){

			if(!this.search.length){
				return false;
			}

			this.noResults = false;
			this.loading = true;
			this.items = [];
			this.$http
				.get('/search/'.concat(this.search))
				.then(function(res){
					this.loading = false;

					if(res.data.length){
						var priceIndex = 0;
						for(var i=0; i < res.data.length; i++){
							//Generate random index between 0 to 4
							var priceIndex = Math.floor(Math.random() * 5) + 0;
							res.data[i].price = PRICES[priceIndex];
						}

						this.results = res.data;
						this.appendItems();
					}
					else{
						this.noResults = true;
					}

					this.lastSearch = this.search;
					this.search = '';
				}
			);
		}
	},
	filters: {
		currency: function(price){
			return '$'.concat(price.toFixed(2));
		}

	},
	mounted: function(){
		this.onSubmitSearch();

		var vueInstance = this;
		var elem = document.getElementById('product-list-bottom');
		var watcher = scrollMonitor.create(elem);

		watcher.enterViewport(function(){
			vueInstance.appendItems();
		});
	}
});