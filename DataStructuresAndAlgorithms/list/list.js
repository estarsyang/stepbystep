
// 实现一个类
function List() {
  // 初始化空数组来保存列表元素
  this.datasource = []
  // 属性
  this.listSize = 0;
  this.pos = 0;
  

  // 方法
  this.length = length
  this.clear = clear 
  this.toString = toString 
  this.getElement = getElement 
  this.insert = insert 
  this.append = append
  this.remove = remove 
  this.front = front 
  this.end = end 
  this.prev = prev 
  this.next = next 
  this.hasNext = hasNext 
  this.hasPrev = hasPrev 
  this.currPos = currPos 
  this.moveTo = moveTo

  this.find = find
}


function append(element) {
  this.datasource[this.listSize++] = element
}

function remove(element) {
  let pos = this.find(element)
  if(pos > -1) {
    this.datasource.splice(pos,1)
    --this.listSize
  }
  return false
}
function find(element){
  return this.datasource.indexOf(element)
}
function length() {
  return this.datasource.length
}
function toString(){
  return this.datasource.toString()
}
function insert(element,after){ // 假设插入是在某个元素之后
  let pos = this.find(after)
  if(pos > -1){
    this.datasource.splice(pos,1,element)
    ++this.listSize
    return true
  }
  return false
}
function clear(){
  delete this.datasource
  this.datasource = []
  this.listSize = this.currPos = 0
}

function front() {
  this.pos =0
}
function end() {
  this.pos = this.datasource.length-1
}
function prev() {
  if(this.pos !== 0) {
    --this.pos
    return true
  }
  return false
}
function next() {
  if(this.pos < this.listSize) {
    ++this.pos
    return true
  }
  return false
}

function currPos(){
  return this.pos
}
function moveTo(position) {
  this.pos = position
}
function getElement() {
  return this.datasource[this.pos]
}

function hasNext() {
  return this.pos < this.datasource.listSize
}
function hasPrev() {
  return this.pos >= 0
}