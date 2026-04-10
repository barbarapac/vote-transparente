export const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
] as const

export const CARGOS = [
  'Presidente', 'Governador', 'Senador', 'Deputado Federal',
  'Deputado Estadual', 'Prefeito', 'Vereador',
] as const

export const CARGOS_COM_ESTADO = new Set(['Governador', 'Senador', 'Deputado Federal', 'Deputado Estadual', 'Prefeito', 'Vereador'])
export const CARGOS_COM_MUNICIPIO = new Set(['Prefeito', 'Vereador'])

export const ANOS_ELEICAO = [2024, 2022, 2020, 2018, 2016, 2014, 2012, 2010] as const
