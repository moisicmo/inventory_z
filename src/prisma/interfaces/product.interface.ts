export const productDefaultSelect = {
  id: true,
  code: true,
  name: true,
  barCode: true,
  visible: true,
  prices:{
    select:{
      id:true,
      typeUnit: true,
      price: true,
    }
  }
};