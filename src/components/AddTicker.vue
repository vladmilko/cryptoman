<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model='ticker'
            @keydown.enter="add"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div
          v-if='validTickers.length'
          class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
            <span
              v-for='tick in validTickers'
              :key='tick'
              @click='addValidTickerToTicker(tick[1].Symbol)'
              class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
            >
              {{ tick[1].Symbol }}
            </span>
          </div>
      </div>
    </div>
    <add-button
      @click='add'
      :disabled='disabled'
    />
  </section>
</template>

<script>
import AddButton from './AddButton.vue';

export default {
  components: {
    AddButton,
  },

  data() {
    return {
      ticker: '',
      listOfAlltickets: [],
      validTickers: [],
      lengthValidTickers: 4,
    };
  },

  props: {
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  emits: {
    'add-ticker': (value) => typeof value === 'string' && value.length,
  },

  created() {
    this.getAllTickets();
  },

  methods: {
    add() {
      if (!this.ticker.length) return;
      this.$emit('add-ticker', this.ticker.toUpperCase(), Object.entries(this.listOfAlltickets).map(([key]) => key));
      this.ticker = '';
    },

    async getAllTickets() {
      const req = await fetch('https://min-api.cryptocompare.com/data/all/coinlist?summary=true');
      this.listOfAlltickets = (await req.json()).Data;
    },

    addValidTickerToTicker(tickSymbol) {
      this.ticker = tickSymbol;
      this.add();
    },

  },

  watch: {
    ticker() {
      if (!this.ticker.length) {
        this.validTickers = [];
        return;
      }

      this.validTickers = Object.entries(this.listOfAlltickets)
        .filter((tick) => tick[1].Symbol.includes(this.ticker.toUpperCase()))
        .sort((a, b) => a > b)
        .slice(0, this.lengthValidTickers);
    },
  },
};
</script>
