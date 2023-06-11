import { Box, Button, Center, ChakraProvider, FormControl, FormLabel, Heading, Input, NumberInput, NumberInputField, Select, SimpleGrid, Spacer, Tab, TabList, TabPanel, TabPanels, Tabs, Text} from '@chakra-ui/react'
import React, { Component } from 'react'
import {Table,Thead,Tbody,Tr,Th,Td,TableContainer} from '@chakra-ui/react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'




export default class Main extends Component {
  dates() {
    const date = new Date()
    let day = date.getDate()
    let month = date.getMonth() + 1
    const year = date.getFullYear()
    if (day < 10) {
      day = "0" + day
    }
    if (month < 10) {
      month = "0" + month
    }
    return year + "-" + month + "-" + day
  }
  datescdpmin() {
    const date = new Date()
    let day = date.getDate()
    let month = date.getMonth() + 2
    const year = date.getFullYear()
    if (day < 10) {
      day = "0" + day
    }
    if (month < 10) {
      month = "0" + month
    }
    return year + "-" + month + "-" + day
  }
  constructor(props) {
    super(props);
    this.state = {
      summ: 999000,
      precent: 2.9,
      months: 60,
      sms: 0,
      date: this.dates(),
      creditInput: 'hide',
      grafic: 'none',
      isOpen: false,
      cdpdatemin: this.datescdpmin(),
      cdpmonth: null,
      cdpsumm: 0,
    }
  }


  toggleModal = ()=>{
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }))
  }



  decimalAdjust(type, value, exp) {
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // Если значение не является числом, либо степень не является целым числом...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }
  round10 = function(value, exp) {
    return this.decimalAdjust('round', value, exp);
  };
  overpayment() {
    const precent = Number(this.state.precent) * 0.010000
    const months = this.state.months
    const overpayment = (precent/12*((1+precent/12))**months)/(((1+precent/12)**months)-1)
    return  overpayment
  };
  overpay() {
    const summ = this.state.summ
    const months = this.state.months
    return  ((summ * this.overpayment()) * months) - summ
  }
  howMuchDays (year , month) {
    var date1 = new Date(year, month-1, 1);
    var date2 = new Date(year, month, 1);
    return Math.round((date2 - date1) / 1000 / 3600 / 24);
  }
  days_of_a_year(year) {  
    return this.isLeapYear(year) ? 366 : 365;
  }
  isLeapYear(year) {
       return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
  }

  grafic() {
    const summ = this.state.summ;
    const sms = Number(this.state.sms);
    const precent = Number(this.state.precent) * 0.010000;
    const months = this.state.months;
    const pdpdate = new Date(Date.parse(this.state.pdpdate+'T00:00:00'));
    let pdpmonth = 0
    let pdpyear = 0
    if (this.state.pdpdate) {
      pdpmonth = pdpdate.getMonth()
      pdpyear = pdpdate.getFullYear()
    }
    
    
    const overpayment = this.overpayment();
    const date =  new Date(this.state.date);
    let summ2 = summ
    let over = (precent/12*((1+precent/12))**months)/(((1+precent/12)**months)-1)
    let ej = overpayment * summ2
    let mes = date.getMonth()  + 1
    let year = date.getFullYear()
    let ret = [[date.toLocaleDateString(), 0, 0, 0, summ, 0, 0]]
    let ostmonth = months - 1

    for (let index = 0; index < months; index++) {
      let pr = summ2 * precent * this.howMuchDays(year, mes) / this.days_of_a_year(year)
      let sj = 0
      if (pdpmonth === mes && pdpyear === year) {
        sj = (summ2 - pr)
        index = months - 1
        summ2 -= sj
      } else if (index === Number(this.state.cdpmonth)) {
            sj = (Number(this.state.cdpsumm) + ej - pr)
            let over = (precent/12*((1+precent/12))**ostmonth)/(((1+precent/12)**ostmonth)-1)
            summ2 -= sj
            ej = over * summ2
        } else {
        sj = (ej - pr)
        summ2 -= sj
      }
      if (mes >= 12) {
        mes = 1
        year++
      }else{
        mes++
      }
      ostmonth -= 1
      let justdate = new Date(Date.parse(year+'-'+mes+'-'+date.getDate()) + 'T00:00:00').toLocaleDateString() 
      if (index === months -1) {
          ret.push([justdate,pr + sj+summ2+sms,pr, sj+summ2, summ2-summ2, this.state.sms, index])
      }else{
        ret.push([justdate,pr + sj + sms,pr, sj, summ2, this.state.sms, index])
      }
    }
    return ret
  }

  smsinfo() {
    const sms = this.state.sms
    if (sms > 0) {
      return [(<Td>Смс</Td>)]
    }
  }

  sum(x) {
    let s = 0;
    for (let index = 0; index < x.length; index++) {
      s += x[index]
    }
    return s
  }



  render() {
    return (
      <ChakraProvider>
        <Tabs padding={0} variant='enclosed' bg="#f5f7fa">
          <TabList>
            <Tab>Кредитный калькулятор</Tab>
            <Tab>ЛБК</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className={this.state.creditInput}>
            <Center>
          <Box bg="white" border="1px solid rgba(0,0,0,0)" borderRadius="6" w='550px' padding={15}>
            <Box><Heading fontSize='3xl'>Кредитный калькулятор</Heading></Box>
            <Box h={25} />
            <Spacer/>
          <SimpleGrid columns={2} spacing={5} minChildWidth='220px'>
            <Box>
              <Text mb='8px'>Сумма кредита</Text>
              <NumberInput defaultValue={this.state.summ} min={10} max={999999999} onChange={e=>this.setState({summ: e})}>
                <NumberInputField />
              </NumberInput>
            </Box>
            <Box>
              <Text mb='8px'>Процентная ставка</Text>
              <NumberInput defaultValue={this.state.precent} min={1} max={99} step={0.2} onChange={e=>this.setState({precent: e})}>
                <NumberInputField />
              </NumberInput>
            </Box>
            <Box>
              <Text mb='8px'>Кол-во месяцев</Text>
              <NumberInput defaultValue={this.state.months} min={3} max={99} onChange={e=>this.setState({months: e})}>
                <NumberInputField />
              </NumberInput>
            </Box>
            <Box>
              <Text mb='8px'>Дата получения</Text>
              <Input
                type="date"
                onChange={event => this.setState({date: event.target.value}) }
                defaultValue={this.state.date}
              />
            </Box>
            <Box>
              <Button w="100%" colorScheme='red' variant='outline' onClick={this.toggleModal}>ЧДП</Button>
            </Box>
            <Box>
              <button className='w100' onClick={e=>this.setState({grafic: 'hide', creditInput: 'none'})}><Button w="100%" colorScheme='blue'>Расчитать</Button></button>
            </Box>
          </SimpleGrid>
          </Box>
        </Center>
        </div>


        <Modal
        isOpen={this.state.isOpen}
        onClose={this.toggleModal}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Частичное погашение</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Дата погашения</FormLabel>
              {/* <Input
                type="date"
                min={this.state.date}
                defaultValue={this.state.cdpdatemin }
              /> */}
              <Select onChange={e=>{this.setState({cdpmonth: e.target.value}); console.log(e.target.value)}} placeholder='Выберите месяц'>
                {this.grafic().map((el)=>(
                  <option value={el[6]}>{el[0]}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Сумма погашения</FormLabel>
              <NumberInput onChange={e=>this.setState({cdpsumm: e})} defaultValue='0' min={1} max={this.state.summ} >
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={this.toggleModal} variant='outline' colorScheme='blue' mr={3}>
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>


          <div className={this.state.grafic}>
                <Center p={15} bg='white'>
                <Heading>Расчет</Heading>
                <Spacer />
                <button onClick={e=>this.setState({grafic: 'none', creditInput: 'hide'})}><Button>Закрыть</Button></button>
                </Center>
                <Center p={15}><Text fontSize="xl">Сумма кредита: {Intl.NumberFormat("ru", {style: "currency", currency: "RUB"}).format(this.state.summ)}</Text><Spacer/></Center>
                <Center p={15}><Text fontSize="xl">Сумма переплаты: {Intl.NumberFormat("ru-RU", {style: "currency", currency: "RUB"}).format(this.round10(this.sum(this.grafic().map(el=>el[2]))), -2)}</Text><Spacer/></Center>
                <Center p={15}><Text fontSize="xl">Процентная: {this.state.precent}%</Text><Spacer/></Center>
                <Center p={15}><Text fontSize="xl">Кол-во месяцев: {this.state.months}</Text><Spacer/></Center>
              <Center bg='white'>
              <TableContainer w="90%">
            <Table variant='simple'>
              <Thead bg="blue.400">
                <Tr>
                  <Th color="white">Дата</Th>
                  <Th color="white">Платёж</Th>
                  <Th color="white">Процент</Th>
                  <Th color="white">Тело кредита</Th>
                  <Th color="white">Остаток</Th>
                </Tr>
              </Thead>
              <Tbody>
                {this.grafic().map((el)=>(
                <Tr>
                  <Td>{el[0]}</Td>
                  <Td>{Intl.NumberFormat("ru", {style: "currency", currency: "RUB"}).format(el[1])}</Td>
                  <Td>{Intl.NumberFormat("ru", {style: "currency", currency: "RUB"}).format(el[2] + Number(this.state.sms))}</Td>
                  <Td>{Intl.NumberFormat("ru", {style: "currency", currency: "RUB"}).format(el[3])}</Td>
                  <Td>{Intl.NumberFormat("ru", {style: "currency", currency: "RUB"}).format(el[4])}</Td>
                </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          </Center>
          </div>
            </TabPanel>
            <TabPanel>
            <Heading>В ПРОЦЕССЕ РАЗРАБОТКИ</Heading>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </ChakraProvider>
    )
  }
}
