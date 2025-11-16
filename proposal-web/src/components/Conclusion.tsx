'use client'

import { motion } from 'framer-motion'

export default function Conclusion() {
  return (
    <section id="conclusion" className="py-20 px-4 bg-gradient-to-br from-secondary via-secondary-light to-secondary-dark">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">
            Conclusión
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl shadow-lg border-t-4 border-primary"
          >
            <p className="text-lg leading-relaxed text-gray-100 max-w-4xl mx-auto text-center">
              Urbanísima Constructora S.R.L representa una oportunidad de proyecto interesante con un cliente altamente comprometido. Sin embargo, es <strong className="text-primary">fundamental negociar correctamente los aspectos de presupuesto, cronograma y alcance</strong> antes de iniciar el desarrollo para garantizar el éxito del proyecto y la satisfacción del cliente. La empresa tiene claras sus necesidades comerciales y la presencia digital es estratégica para su crecimiento. Con la ejecución adecuada, este sitio web puede convertirse en una herramienta poderosa para captar nuevos clientes.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
