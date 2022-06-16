{{#wrappers}}
import W_{{{ index }}} from '{{{ wrapper }}}'
{{/wrappers}}
import Comp from '{{{ file }}}'

const Nested = ()=>{
   return [
{{#wrappers}}
    W_{{{ index }}},
{{/wrappers}}
  ].reduceRight((children, W) => {
    return <W>{children}</W>
  }, <Comp />)
}

export default Nested;
