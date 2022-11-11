<template>
  <div class="expression-box">
    <div class="item" v-for="(item, index) of expressionList" :key="index" @click="chooseExpression(item)">{{ item }}</div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { expressionList } from '../../Constant/expression';
@Component({})
export default class ExpressionBox extends Vue {
  expressionList = expressionList;
  chooseExpression(item: string) {
    this.$emit('addExpression', item);
  }
}
</script>
<style scoped>
.expression-box {
  display: flex;
  flex-wrap: wrap;
  padding: 14px 14px 14px 20px;
  width: 400px;
  height: 400px;
  background-color: #fff;
  box-shadow: 0px 0px 20px 0px rgba(221, 172, 172, 0.1), 0px 12px 12px 0px rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  overflow: auto;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
.item {
  padding: 6px 10px;
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
}
</style>
